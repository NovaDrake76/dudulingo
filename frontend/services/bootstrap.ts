import { getDb } from "./db";
import {
  listInstalledPacks,
  upsertCard,
  upsertDeck,
  upsertPackVersion,
} from "./db/queries";
import logger from "./logger";
import {
  BUNDLED_DECKS,
  BUNDLED_VERSION,
  expandBundledDeck,
} from "./bundledContent";

let _bootstrapped: Promise<void> | null = null;

/**
 * Initialize the local database and install all bundled decks if the current
 * bundled version is newer than what's already installed. Idempotent — safe
 * to call on every app launch. Concurrent callers share one promise.
 */
export function bootstrap(): Promise<void> {
  if (_bootstrapped) return _bootstrapped;
  _bootstrapped = doBootstrap().catch((err) => {
    _bootstrapped = null; // allow retry on failure
    throw err;
  });
  return _bootstrapped;
}

async function doBootstrap(): Promise<void> {
  await getDb(); // runs migrations

  const installed = await listInstalledPacks();
  const installedMap = new Map(installed.map((p) => [p.lang, p.active_version]));
  const langsInBundle = new Set(BUNDLED_DECKS.map((d) => d.lang));

  const langsNeedingSeed = Array.from(langsInBundle).filter((lang) => {
    const existing = installedMap.get(lang);
    return !existing || existing < BUNDLED_VERSION;
  });

  if (langsNeedingSeed.length === 0) {
    logger.debug(
      `Bundled content already installed (v${BUNDLED_VERSION}); skipping seed`,
    );
    return;
  }

  logger.info(
    `Seeding bundled decks for: ${langsNeedingSeed.join(", ")} (v${BUNDLED_VERSION})`,
  );

  const now = Date.now();
  for (const deck of BUNDLED_DECKS) {
    if (!langsNeedingSeed.includes(deck.lang)) continue;

    await upsertDeck({
      id: deck.id,
      name: deck.name,
      description: deck.description,
      lang: deck.lang,
      pack_version: BUNDLED_VERSION,
      updated_at: now,
    });

    for (const card of expandBundledDeck(deck)) {
      await upsertCard({
        id: card.id,
        deck_id: card.deck_id,
        type: card.type,
        level: card.level,
        prompt: card.prompt,
        answer: card.answer,
        image_path: null,
        image_source: null,
        image_license: null,
        audio_path: null,
        emoji: card.emoji,
        image_key: card.image_key,
        lang: card.lang,
        pack_version: card.pack_version,
      });
    }
  }

  for (const lang of langsNeedingSeed) {
    await upsertPackVersion({
      lang,
      active_version: BUNDLED_VERSION,
      folder_path: "", // bundled — no on-disk folder
      installed_at: now,
    });
  }
}

/**
 * Test helper — allows bootstrap() to run again in a fresh test.
 */
export function resetBootstrapForTests(): void {
  _bootstrapped = null;
}
