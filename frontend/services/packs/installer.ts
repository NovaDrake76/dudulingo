import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system/legacy";
import { unzipSync } from "fflate";
import { getDb } from "../db";
import { packFolderFor, packRootDir, stagingFolderFor } from "../db/paths";
import {
  deletePackVersion,
  getActivePack,
  upsertPackVersion,
} from "../db/queries";
import logger from "../logger";
import type { PackManifestEntry } from "./manifest";

export interface PackPayload {
  lang: string;
  version: number;
  name: string;
  description?: string;
  decks: {
    id: string;
    name: string;
    description?: string | null;
    lang: string;
  }[];
  cards: {
    id: string;
    deck_id: string;
    type: string;
    level?: number;
    prompt?: string | null;
    answer: string;
    image_path?: string | null;
    image_source?: string | null;
    image_license?: string | null;
    audio_path?: string | null;
    lang: string;
  }[];
}

/**
 * Guard shared with the review screen / app routes: while `true`, installers
 * must not swap the active pack folder for a language that is currently being
 * reviewed. The review session reads files from an already-resolved path at
 * session start, but we still avoid racing.
 */
let reviewInProgress = 0;

export function beginReviewSession() {
  reviewInProgress++;
}

export function endReviewSession() {
  reviewInProgress = Math.max(0, reviewInProgress - 1);
}

export function isReviewInProgress() {
  return reviewInProgress > 0;
}

async function ensureDir(path: string) {
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(path, { intermediates: true });
  }
}

async function removePath(path: string) {
  const info = await FileSystem.getInfoAsync(path);
  if (info.exists) {
    await FileSystem.deleteAsync(path, { idempotent: true });
  }
}

/**
 * Pure-JS unzip. We do this in JS instead of via `react-native-zip-archive`
 * because that native module has been flaky across JDK/Gradle upgrades.
 * Packs are capped at ~25 MB so in-memory expansion is acceptable.
 */
async function extractZipToDir(zipUri: string, destDir: string): Promise<void> {
  const zipBase64 = await FileSystem.readAsStringAsync(zipUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const zipBytes = Buffer.from(zipBase64, "base64");
  const entries = unzipSync(
    new Uint8Array(zipBytes.buffer, zipBytes.byteOffset, zipBytes.byteLength),
  );

  for (const [relPath, bytes] of Object.entries(entries)) {
    if (relPath.endsWith("/")) continue; // directory entry
    const outPath = destDir + relPath;
    const slash = outPath.lastIndexOf("/");
    if (slash > 0) {
      await FileSystem.makeDirectoryAsync(outPath.slice(0, slash + 1), {
        intermediates: true,
      });
    }
    const base64 = Buffer.from(bytes).toString("base64");
    await FileSystem.writeAsStringAsync(outPath, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }
}

export interface InstallProgress {
  phase:
    | "downloading"
    | "extracting"
    | "reading-manifest"
    | "writing-db"
    | "activating"
    | "done";
  bytesTotal?: number;
  bytesWritten?: number;
}

export interface InstallResult {
  lang: string;
  version: number;
  folderPath: string;
}

export async function installPack(
  entry: PackManifestEntry,
  opts: { onProgress?: (p: InstallProgress) => void } = {},
): Promise<InstallResult> {
  if (isReviewInProgress()) {
    throw new Error("Cannot install a pack during an active review session");
  }

  const onProgress = opts.onProgress ?? (() => undefined);
  const { lang, version, url, sizeBytes } = entry;

  await ensureDir(packRootDir());
  const downloadsDir = `${packRootDir()}.downloads/`;
  await ensureDir(downloadsDir);
  const zipPath = `${downloadsDir}${lang}-v${version}.zip`;
  await removePath(zipPath);

  onProgress({ phase: "downloading", bytesTotal: sizeBytes, bytesWritten: 0 });

  const downloadResumable = FileSystem.createDownloadResumable(
    url,
    zipPath,
    {},
    (progress) => {
      onProgress({
        phase: "downloading",
        bytesTotal: progress.totalBytesExpectedToWrite || sizeBytes,
        bytesWritten: progress.totalBytesWritten,
      });
    },
  );
  const downloaded = await downloadResumable.downloadAsync();
  if (!downloaded) throw new Error(`Download aborted: ${url}`);

  const stagingDir = stagingFolderFor(lang, version);
  await removePath(stagingDir);
  await ensureDir(stagingDir);

  onProgress({ phase: "extracting" });
  await extractZipToDir(downloaded.uri, stagingDir);

  onProgress({ phase: "reading-manifest" });
  const payloadPath = `${stagingDir}pack.json`;
  const payloadInfo = await FileSystem.getInfoAsync(payloadPath);
  if (!payloadInfo.exists) {
    throw new Error(
      `Pack is missing pack.json at ${payloadPath}. Did the builder emit it?`,
    );
  }
  const payloadText = await FileSystem.readAsStringAsync(payloadPath);
  const payload = JSON.parse(payloadText) as PackPayload;

  if (payload.lang !== lang || payload.version !== version) {
    throw new Error(
      `Pack payload mismatch: manifest says ${lang} v${version}, payload says ${payload.lang} v${payload.version}`,
    );
  }

  onProgress({ phase: "writing-db" });
  const db = await getDb();
  const now = Date.now();
  await db.withTransactionAsync(async () => {
    for (const d of payload.decks) {
      await db.runAsync(
        `INSERT INTO decks (id, name, description, lang, pack_version, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           description = excluded.description,
           lang = excluded.lang,
           pack_version = excluded.pack_version,
           updated_at = excluded.updated_at`,
        d.id,
        d.name,
        d.description ?? null,
        d.lang,
        payload.version,
        now,
      );
    }
    for (const c of payload.cards) {
      await db.runAsync(
        `INSERT INTO cards (id, deck_id, type, level, prompt, answer,
                            image_path, image_source, image_license, audio_path,
                            lang, pack_version)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           deck_id = excluded.deck_id,
           type = excluded.type,
           level = excluded.level,
           prompt = excluded.prompt,
           answer = excluded.answer,
           image_path = excluded.image_path,
           image_source = excluded.image_source,
           image_license = excluded.image_license,
           audio_path = excluded.audio_path,
           lang = excluded.lang,
           pack_version = excluded.pack_version`,
        c.id,
        c.deck_id,
        c.type,
        c.level ?? 1,
        c.prompt ?? null,
        c.answer,
        c.image_path ?? null,
        c.image_source ?? null,
        c.image_license ?? null,
        c.audio_path ?? null,
        c.lang,
        payload.version,
      );
    }
  });

  onProgress({ phase: "activating" });
  const finalFolder = packFolderFor({
    lang,
    active_version: version,
    folder_path: "",
    installed_at: 0,
  });
  const oldPack = await getActivePack(lang);
  await removePath(finalFolder);
  await FileSystem.moveAsync({ from: stagingDir, to: finalFolder });

  await upsertPackVersion({
    lang,
    active_version: version,
    folder_path: finalFolder,
    installed_at: now,
  });

  // cleanup: delete the downloaded zip
  await removePath(downloaded.uri);

  // cleanup: remove the previous version's folder if any
  if (oldPack && oldPack.active_version !== version && oldPack.folder_path) {
    await removePath(oldPack.folder_path);
  }

  onProgress({ phase: "done" });
  logger.info(`Installed pack ${lang} v${version}`);

  return { lang, version, folderPath: finalFolder };
}

export async function uninstallPack(lang: string): Promise<void> {
  if (isReviewInProgress()) {
    throw new Error("Cannot uninstall a pack during an active review session");
  }
  const pack = await getActivePack(lang);
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      "DELETE FROM cards WHERE lang = ? AND pack_version > 0",
      lang,
    );
    await db.runAsync(
      "DELETE FROM decks WHERE lang = ? AND pack_version > 0",
      lang,
    );
  });
  await deletePackVersion(lang);
  if (pack?.folder_path) await removePath(pack.folder_path);
  logger.info(`Uninstalled pack for ${lang}`);
}
