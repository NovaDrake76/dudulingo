/**
 * Pack builder — produces a language-pack zip the mobile app can install
 * from GitHub Releases (or any static host).
 *
 * Inputs:  backend/scripts/packs/<lang>.json  (deck definitions, see it.json)
 * Outputs: backend/dist/packs/<lang>-v<n>/    (working dir with pack.json, images/, audio/)
 *          backend/dist/packs/<lang>-v<n>.zip (the uploadable artifact)
 *          backend/dist/packs/manifest.json   (aggregated index over all built packs)
 *
 * Usage:
 *   node --import tsx/esm backend/scripts/pack-builder.ts --lang=it --version=1
 *   With Google TTS creds:  GOOGLE_APPLICATION_CREDENTIALS=./key.json ... --lang=it
 *   Without images (fast iteration):  ... --lang=it --no-images
 *
 * The builder is best-effort: if an image search returns nothing, the card
 * ships without an image; if GOOGLE_APPLICATION_CREDENTIALS is unset, audio
 * generation is silently skipped for those cards.
 */

import archiver from 'archiver';
import { createHash } from 'crypto';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'fs';
import path from 'path';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import type { google } from '@google-cloud/text-to-speech/build/protos/protos';

// ---------- types ----------

interface SourceCard {
  prompt: string;
  answer: string;
  search?: string;
  audio?: boolean;
}

interface SourceDeck {
  id: string;
  name: string;
  description?: string;
  cards: SourceCard[];
}

interface SourcePack {
  lang: string;
  version: number;
  name: string;
  description?: string;
  decks: SourceDeck[];
}

interface BuiltDeck {
  id: string;
  name: string;
  description?: string | null;
  lang: string;
}

interface BuiltCard {
  id: string;
  deck_id: string;
  type: string;
  level: number;
  prompt: string;
  answer: string;
  image_path: string | null;
  image_source: string | null;
  image_license: string | null;
  audio_path: string | null;
  lang: string;
}

interface PackPayload {
  lang: string;
  version: number;
  name: string;
  description?: string;
  decks: BuiltDeck[];
  cards: BuiltCard[];
}

interface ManifestEntry {
  lang: string;
  version: number;
  name: string;
  url: string;
  sizeBytes: number;
  sha256: string;
  description?: string;
}

interface Manifest {
  generatedAt: string;
  packs: ManifestEntry[];
}

// ---------- CLI ----------

const argv = new Map<string, string>();
for (const a of process.argv.slice(2)) {
  if (!a.startsWith('--')) continue;
  const [k, v] = a.replace(/^--/, '').split('=');
  argv.set(k, v ?? 'true');
}

const LANG = argv.get('lang');
const VERSION = argv.get('version') ? Number(argv.get('version')) : undefined;
const NO_IMAGES = argv.get('no-images') === 'true';
const NO_AUDIO = argv.get('no-audio') === 'true';
const BASE_URL =
  argv.get('base-url') ??
  process.env.PACK_BASE_URL ??
  'https://github.com/novadrake/dudulingo/releases/download/packs-latest';

if (!LANG) {
  console.error('Missing --lang=<code> (e.g. --lang=it)');
  process.exit(2);
}

// ---------- helpers ----------

const ROOT = path.resolve(process.cwd());
const DIST = path.join(ROOT, 'dist', 'packs');
const SRC = path.join(ROOT, 'scripts', 'packs', `${LANG}.json`);

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'x'
  );
}

function log(msg: string) {
  process.stdout.write(`[pack] ${msg}\n`);
}

function warn(msg: string) {
  process.stderr.write(`[pack] WARN: ${msg}\n`);
}

function ensureDir(p: string) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function resetDir(p: string) {
  if (existsSync(p)) rmSync(p, { recursive: true, force: true });
  mkdirSync(p, { recursive: true });
}

// ---------- image fetching (Openverse, CC0 only) ----------

const OPENVERSE_API = 'https://api.openverse.org/v1/images/';

interface OpenverseResult {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  license: string;
  creator?: string;
  creator_url?: string;
  foreign_landing_url?: string;
}

async function searchCC0Image(query: string): Promise<OpenverseResult | null> {
  const url = `${OPENVERSE_API}?q=${encodeURIComponent(query)}&license=cc0&page_size=5&filter_dead=true`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Dudulingo/1.0 pack-builder' },
    });
    if (!res.ok) {
      warn(`Openverse ${res.status} for "${query}"`);
      return null;
    }
    const data = (await res.json()) as { results: OpenverseResult[] };
    return data.results?.[0] ?? null;
  } catch (err) {
    warn(`Openverse failed for "${query}": ${String(err)}`);
    return null;
  }
}

async function downloadBinary(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const arr = new Uint8Array(await res.arrayBuffer());
    return Buffer.from(arr);
  } catch (err) {
    warn(`Image download failed (${url}): ${String(err)}`);
    return null;
  }
}

// ---------- TTS ----------

const VOICE_MAP: Record<string, { languageCode: string; name: string }> = {
  en: { languageCode: 'en-US', name: 'en-US-Neural2-J' },
  'pt-BR': { languageCode: 'pt-BR', name: 'pt-BR-Neural2-B' },
  it: { languageCode: 'it-IT', name: 'it-IT-Neural2-C' },
  de: { languageCode: 'de-DE', name: 'de-DE-Neural2-B' },
};

let ttsClient: TextToSpeechClient | null = null;
function ttsAvailable(): boolean {
  return !NO_AUDIO && !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
}
function getTtsClient(): TextToSpeechClient {
  if (!ttsClient) ttsClient = new TextToSpeechClient();
  return ttsClient;
}

async function synthesize(text: string, lang: string): Promise<Buffer | null> {
  if (!ttsAvailable()) return null;
  const voice = VOICE_MAP[lang] ?? VOICE_MAP.en;
  const client = getTtsClient();
  const request: google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
    input: { text },
    voice: {
      languageCode: voice.languageCode,
      name: voice.name,
      ssmlGender: 'MALE',
    },
    audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9, pitch: 0 },
  };
  try {
    const [response] = await client.synthesizeSpeech(request);
    if (!response.audioContent) return null;
    return Buffer.from(response.audioContent as Uint8Array);
  } catch (err) {
    warn(`TTS failed for "${text}": ${String(err)}`);
    return null;
  }
}

// ---------- build ----------

async function build() {
  if (!existsSync(SRC)) {
    console.error(`Source pack not found: ${SRC}`);
    process.exit(1);
  }

  const source: SourcePack = JSON.parse(readFileSync(SRC, 'utf8'));
  const version = VERSION ?? source.version;
  const lang = source.lang;

  log(`building ${lang} v${version} from ${path.relative(ROOT, SRC)}`);
  log(`images: ${NO_IMAGES ? 'skipped' : 'on'} | audio: ${ttsAvailable() ? 'on' : 'skipped'}`);

  const stagingRoot = path.join(DIST, `${lang}-v${version}`);
  resetDir(stagingRoot);
  ensureDir(path.join(stagingRoot, 'images'));
  ensureDir(path.join(stagingRoot, 'audio'));

  const builtDecks: BuiltDeck[] = [];
  const builtCards: BuiltCard[] = [];

  for (const deck of source.decks) {
    builtDecks.push({
      id: deck.id,
      name: deck.name,
      description: deck.description ?? null,
      lang,
    });

    for (const card of deck.cards) {
      const cardId = `${deck.id}-${slug(card.answer)}`;
      let imagePath: string | null = null;
      let imageSource: string | null = null;
      let imageLicense: string | null = null;
      let audioPath: string | null = null;

      if (!NO_IMAGES && card.search) {
        const hit = await searchCC0Image(card.search);
        if (hit) {
          const bytes = await downloadBinary(hit.url);
          if (bytes) {
            const ext = path.extname(new URL(hit.url).pathname).split('?')[0] || '.jpg';
            const filename = `${slug(card.answer)}${ext}`;
            writeFileSync(path.join(stagingRoot, 'images', filename), bytes);
            imagePath = `images/${filename}`;
            imageSource = hit.foreign_landing_url ?? hit.url;
            imageLicense = `CC0 · ${hit.creator ?? 'Unknown'}`;
            log(`  image: ${card.search} -> ${filename} (${bytes.length} bytes)`);
          }
        } else {
          warn(`  no CC0 image for "${card.search}"`);
        }
      }

      if (card.audio && ttsAvailable()) {
        const bytes = await synthesize(card.answer, lang);
        if (bytes) {
          const filename = `${slug(card.answer)}.mp3`;
          writeFileSync(path.join(stagingRoot, 'audio', filename), bytes);
          audioPath = `audio/${filename}`;
          log(`  audio: ${card.answer} -> ${filename} (${bytes.length} bytes)`);
        }
      }

      builtCards.push({
        id: cardId,
        deck_id: deck.id,
        type: 'basic',
        level: 1,
        prompt: card.prompt,
        answer: card.answer,
        image_path: imagePath,
        image_source: imageSource,
        image_license: imageLicense,
        audio_path: audioPath,
        lang,
      });
    }
  }

  const payload: PackPayload = {
    lang,
    version,
    name: source.name,
    description: source.description,
    decks: builtDecks,
    cards: builtCards,
  };

  writeFileSync(
    path.join(stagingRoot, 'pack.json'),
    JSON.stringify(payload, null, 2),
  );

  // zip the staging folder
  const zipPath = path.join(DIST, `${lang}-v${version}.zip`);
  if (existsSync(zipPath)) rmSync(zipPath);
  await new Promise<void>((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', () => resolve());
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(stagingRoot, false);
    archive.finalize();
  });

  const stat = statSync(zipPath);
  const sha256 = createHash('sha256')
    .update(readFileSync(zipPath))
    .digest('hex');

  log(`built ${zipPath} (${(stat.size / 1024).toFixed(1)} KB, sha256=${sha256.slice(0, 12)}…)`);

  // update manifest.json
  const manifestPath = path.join(DIST, 'manifest.json');
  const existing: Manifest = existsSync(manifestPath)
    ? (JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest)
    : { generatedAt: '', packs: [] };

  const filtered = existing.packs.filter((p) => p.lang !== lang);
  const entry: ManifestEntry = {
    lang,
    version,
    name: source.name,
    description: source.description,
    url: `${BASE_URL.replace(/\/$/, '')}/${lang}-v${version}.zip`,
    sizeBytes: stat.size,
    sha256,
  };
  const manifest: Manifest = {
    generatedAt: new Date().toISOString(),
    packs: [...filtered, entry].sort((a, b) => a.lang.localeCompare(b.lang)),
  };
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  log(`updated ${manifestPath}`);

  log('done.');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});

// ---------- unused but exported for testing ----------
export const __internals__ = { slug };

// keep readdirSync from tree-shaker
void readdirSync;
