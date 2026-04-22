import * as FileSystem from "expo-file-system/legacy";
import type { CardRow, PackVersionRow } from "./types";
import { getActivePack } from "./queries";

/**
 * Packs are extracted to `documentDirectory/packs/<lang>/v<n>/`.
 * Card rows store `image_path` / `audio_path` as paths *relative* to that folder,
 * e.g. `images/cat.webp`. This module resolves them to absolute `file://` URIs
 * usable by <Image source={{ uri }} /> and expo-audio.
 */

export function packRootDir(): string {
  // documentDirectory includes trailing slash
  return `${FileSystem.documentDirectory}packs/`;
}

export function packFolderFor(pack: PackVersionRow): string {
  return `${packRootDir()}${pack.lang}/v${pack.active_version}/`;
}

export function stagingFolderFor(lang: string, version: number): string {
  return `${packRootDir()}.staging/${lang}-v${version}/`;
}

function resolveRelative(folder: string, relative: string | null): string | undefined {
  if (!relative) return undefined;
  // normalize: treat absolute URLs as-is (migration safety)
  if (/^(https?|file|data):/i.test(relative)) return relative;
  return folder + relative.replace(/^\/+/, "");
}

export interface ResolvedCard {
  id: string;
  deckId: string;
  type: string;
  level: number;
  prompt: string;
  answer: string;
  imageUrl?: string;
  imageSource?: string;
  imageLicense?: string;
  audioUrl?: string;
  emoji?: string;
  imageKey?: string;
  lang?: string;
}

export async function resolveCard(card: CardRow): Promise<ResolvedCard> {
  const pack = card.lang ? await getActivePack(card.lang) : null;
  const folder = pack ? packFolderFor(pack) : "";
  return {
    id: card.id,
    deckId: card.deck_id,
    type: card.type,
    level: card.level,
    prompt: card.prompt ?? "",
    answer: card.answer,
    imageUrl: resolveRelative(folder, card.image_path),
    imageSource: card.image_source ?? undefined,
    imageLicense: card.image_license ?? undefined,
    audioUrl: resolveRelative(folder, card.audio_path),
    emoji: card.emoji ?? undefined,
    imageKey: card.image_key ?? undefined,
    lang: card.lang ?? undefined,
  };
}

export async function resolveCards(cards: CardRow[]): Promise<ResolvedCard[]> {
  // cache pack folders per lang to avoid N queries
  const cache = new Map<string, string>();
  const out: ResolvedCard[] = [];
  for (const c of cards) {
    let folder = "";
    if (c.lang) {
      if (!cache.has(c.lang)) {
        const pack = await getActivePack(c.lang);
        cache.set(c.lang, pack ? packFolderFor(pack) : "");
      }
      folder = cache.get(c.lang) ?? "";
    }
    out.push({
      id: c.id,
      deckId: c.deck_id,
      type: c.type,
      level: c.level,
      prompt: c.prompt ?? "",
      answer: c.answer,
      imageUrl: resolveRelative(folder, c.image_path),
      imageSource: c.image_source ?? undefined,
      imageLicense: c.image_license ?? undefined,
      audioUrl: resolveRelative(folder, c.audio_path),
      emoji: c.emoji ?? undefined,
      imageKey: c.image_key ?? undefined,
      lang: c.lang ?? undefined,
    });
  }
  return out;
}
