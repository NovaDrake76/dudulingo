import { getDb } from "./index";
import type {
  CardRow,
  CardWithProgress,
  DeckRow,
  PackVersionRow,
  ProgressRow,
} from "./types";

// ---------- decks ----------

export async function listAllDecks(): Promise<DeckRow[]> {
  const db = await getDb();
  return db.getAllAsync<DeckRow>("SELECT * FROM decks ORDER BY name ASC");
}

export async function listDecksByLang(lang: string): Promise<DeckRow[]> {
  const db = await getDb();
  return db.getAllAsync<DeckRow>(
    "SELECT * FROM decks WHERE lang = ? ORDER BY name ASC",
    lang,
  );
}

export interface DeckWithCardCount extends DeckRow {
  card_count: number;
}

export async function listDecksWithCardCount(
  lang?: string,
): Promise<DeckWithCardCount[]> {
  const db = await getDb();
  const where = lang ? "WHERE d.lang = ?" : "";
  const sql = `SELECT d.*, COUNT(c.id) AS card_count
                 FROM decks d
                 LEFT JOIN cards c ON c.deck_id = d.id
                ${where}
                GROUP BY d.id
                ORDER BY d.name ASC`;
  return lang
    ? db.getAllAsync<DeckWithCardCount>(sql, lang)
    : db.getAllAsync<DeckWithCardCount>(sql);
}

export async function getDeckById(id: string): Promise<DeckRow | null> {
  const db = await getDb();
  return db.getFirstAsync<DeckRow>("SELECT * FROM decks WHERE id = ?", id);
}

export async function upsertDeck(deck: DeckRow): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO decks (id, name, description, lang, pack_version, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       description = excluded.description,
       lang = excluded.lang,
       pack_version = excluded.pack_version,
       updated_at = excluded.updated_at`,
    deck.id,
    deck.name,
    deck.description,
    deck.lang,
    deck.pack_version,
    deck.updated_at,
  );
}

export async function deleteDecksForLang(lang: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM cards WHERE lang = ?", lang);
  await db.runAsync("DELETE FROM decks WHERE lang = ?", lang);
}

// ---------- cards ----------

export async function listCardsInDeck(deckId: string): Promise<CardRow[]> {
  const db = await getDb();
  return db.getAllAsync<CardRow>(
    "SELECT * FROM cards WHERE deck_id = ? ORDER BY level ASC",
    deckId,
  );
}

export async function getCardById(id: string): Promise<CardRow | null> {
  const db = await getDb();
  return db.getFirstAsync<CardRow>("SELECT * FROM cards WHERE id = ?", id);
}

export async function upsertCard(card: CardRow): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO cards (id, deck_id, type, level, prompt, answer,
                        image_path, image_source, image_license, audio_path,
                        emoji, image_key, lang, pack_version)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
       emoji = excluded.emoji,
       image_key = excluded.image_key,
       lang = excluded.lang,
       pack_version = excluded.pack_version`,
    card.id,
    card.deck_id,
    card.type,
    card.level,
    card.prompt,
    card.answer,
    card.image_path,
    card.image_source,
    card.image_license,
    card.audio_path,
    card.emoji,
    card.image_key,
    card.lang,
    card.pack_version,
  );
}

// ---------- progress ----------

export async function getProgress(cardId: string): Promise<ProgressRow | null> {
  const db = await getDb();
  return db.getFirstAsync<ProgressRow>(
    "SELECT * FROM user_card_progress WHERE card_id = ?",
    cardId,
  );
}

export async function upsertProgress(
  row: Omit<ProgressRow, "updated_at" | "synced_at"> & {
    updated_at?: number;
    synced_at?: number | null;
  },
): Promise<void> {
  const db = await getDb();
  const now = row.updated_at ?? Date.now();
  await db.runAsync(
    `INSERT INTO user_card_progress
       (card_id, deck_id, ease_factor, interval, repetitions, next_review_at, updated_at, synced_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(card_id) DO UPDATE SET
       deck_id = excluded.deck_id,
       ease_factor = excluded.ease_factor,
       interval = excluded.interval,
       repetitions = excluded.repetitions,
       next_review_at = excluded.next_review_at,
       updated_at = excluded.updated_at,
       synced_at = excluded.synced_at`,
    row.card_id,
    row.deck_id,
    row.ease_factor,
    row.interval,
    row.repetitions,
    row.next_review_at,
    now,
    row.synced_at ?? null,
  );
}

export async function resetAllProgress(): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM user_card_progress");
  await db.runAsync("DELETE FROM review_events");
}

// ---------- review events (activity history) ----------

export async function insertReviewEvent(row: {
  card_id: string;
  deck_id: string;
  reviewed_at?: number;
  rating?: string | null;
}): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO review_events (card_id, deck_id, reviewed_at, rating)
     VALUES (?, ?, ?, ?)`,
    row.card_id,
    row.deck_id,
    row.reviewed_at ?? Date.now(),
    row.rating ?? null,
  );
}

export async function listReviewEventsSince(
  sinceMs: number,
): Promise<{ reviewed_at: number; rating: string | null }[]> {
  const db = await getDb();
  return db.getAllAsync<{ reviewed_at: number; rating: string | null }>(
    `SELECT reviewed_at, rating FROM review_events
      WHERE reviewed_at >= ? ORDER BY reviewed_at ASC`,
    sinceMs,
  );
}

export async function countReviewEvents(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) AS n FROM review_events",
  );
  return row?.n ?? 0;
}

export async function listDueCountsByDeck(
  now: number = Date.now(),
): Promise<{ deck_id: string; n: number }[]> {
  const db = await getDb();
  return db.getAllAsync<{ deck_id: string; n: number }>(
    `SELECT deck_id, COUNT(*) AS n
       FROM user_card_progress
      WHERE next_review_at <= ?
      GROUP BY deck_id`,
    now,
  );
}

/**
 * Per-deck touched/mastered counts. A card is "mastered" when repetitions >= 5
 * (matches MASTERY_THRESHOLD in api.ts).
 */
export async function listDeckProgressMap(): Promise<
  Record<string, { touched: number; mastered: number }>
> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ deck_id: string; touched: number; mastered: number }>(
    `SELECT deck_id,
            COUNT(*) AS touched,
            SUM(CASE WHEN repetitions >= 5 THEN 1 ELSE 0 END) AS mastered
       FROM user_card_progress
      GROUP BY deck_id`,
  );
  const out: Record<string, { touched: number; mastered: number }> = {};
  for (const r of rows) out[r.deck_id] = { touched: r.touched, mastered: r.mastered };
  return out;
}

/**
 * How many packs (decks) and cards exist for each language with bundled content.
 * Used by the language-picker to show accurate "N packs · M cards" lines.
 */
export async function listLanguageInventory(): Promise<
  { lang: string; packCount: number; cardCount: number }[]
> {
  const db = await getDb();
  const deckRows = await db.getAllAsync<{ lang: string | null; n: number }>(
    `SELECT lang, COUNT(*) AS n FROM decks WHERE lang IS NOT NULL GROUP BY lang`,
  );
  const cardRows = await db.getAllAsync<{ lang: string | null; n: number }>(
    `SELECT lang, COUNT(*) AS n FROM cards WHERE lang IS NOT NULL GROUP BY lang`,
  );
  const cards = new Map<string, number>();
  for (const r of cardRows) if (r.lang) cards.set(r.lang, r.n);
  return deckRows
    .filter((r) => r.lang)
    .map((r) => ({
      lang: r.lang as string,
      packCount: r.n,
      cardCount: cards.get(r.lang as string) ?? 0,
    }));
}

/**
 * Earliest review event — used for "since Apr 2026" copy on the profile.
 */
export async function getFirstReviewAt(): Promise<number | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ first: number | null }>(
    `SELECT MIN(reviewed_at) AS first FROM review_events`,
  );
  return row?.first ?? null;
}

// ---------- session building ----------

/**
 * Cards due for review (any deck), ordered by next_review_at.
 */
export async function listDueProgress(
  limit: number,
  now: number = Date.now(),
): Promise<CardWithProgress[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ProgressRow & CardRow>(
    `SELECT p.*, c.id AS card_id, c.deck_id AS card_deck_id, c.type, c.level,
            c.prompt, c.answer, c.image_path, c.image_source, c.image_license,
            c.audio_path, c.emoji, c.image_key, c.lang, c.pack_version
       FROM user_card_progress p
       JOIN cards c ON c.id = p.card_id
      WHERE p.next_review_at <= ?
      ORDER BY p.next_review_at ASC
      LIMIT ?`,
    now,
    limit,
  );
  return rows.map(rowToCardWithProgress);
}

export async function listLearningProgress(
  limit: number,
  excludeCardIds: string[] = [],
): Promise<CardWithProgress[]> {
  const db = await getDb();
  const excluded = excludeCardIds.length
    ? `AND p.card_id NOT IN (${excludeCardIds.map(() => "?").join(",")})`
    : "";
  const rows = await db.getAllAsync<ProgressRow & CardRow>(
    `SELECT p.*, c.id AS card_id, c.deck_id AS card_deck_id, c.type, c.level,
            c.prompt, c.answer, c.image_path, c.image_source, c.image_license,
            c.audio_path, c.emoji, c.image_key, c.lang, c.pack_version
       FROM user_card_progress p
       JOIN cards c ON c.id = p.card_id
      WHERE 1=1 ${excluded}
      ORDER BY p.repetitions ASC, p.next_review_at ASC
      LIMIT ?`,
    ...excludeCardIds,
    limit,
  );
  return rows.map(rowToCardWithProgress);
}

export async function listNewCardsInLang(
  lang: string,
  limit: number,
  excludeCardIds: string[] = [],
): Promise<CardRow[]> {
  const db = await getDb();
  const excluded = excludeCardIds.length
    ? `AND c.id NOT IN (${excludeCardIds.map(() => "?").join(",")})`
    : "";
  return db.getAllAsync<CardRow>(
    `SELECT c.* FROM cards c
      LEFT JOIN user_card_progress p ON p.card_id = c.id
      WHERE c.lang = ? AND p.card_id IS NULL ${excluded}
      ORDER BY c.level ASC, c.id ASC
      LIMIT ?`,
    lang,
    ...excludeCardIds,
    limit,
  );
}

export async function listCardsInDeckWithProgress(
  deckId: string,
): Promise<CardWithProgress[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<
    CardRow & {
      p_ease_factor: number | null;
      p_interval: number | null;
      p_repetitions: number | null;
      p_next_review_at: number | null;
      p_updated_at: number | null;
      p_synced_at: number | null;
    } & { emoji: string | null; image_key: string | null }
  >(
    `SELECT c.*,
            p.ease_factor AS p_ease_factor,
            p.interval AS p_interval,
            p.repetitions AS p_repetitions,
            p.next_review_at AS p_next_review_at,
            p.updated_at AS p_updated_at,
            p.synced_at AS p_synced_at
       FROM cards c
       LEFT JOIN user_card_progress p ON p.card_id = c.id
      WHERE c.deck_id = ?
      ORDER BY c.level ASC, c.id ASC`,
    deckId,
  );

  return rows.map((r) => ({
    card: {
      id: r.id,
      deck_id: r.deck_id,
      type: r.type,
      level: r.level,
      prompt: r.prompt,
      answer: r.answer,
      image_path: r.image_path,
      image_source: r.image_source,
      image_license: r.image_license,
      audio_path: r.audio_path,
      emoji: r.emoji,
      image_key: r.image_key,
      lang: r.lang,
      pack_version: r.pack_version,
    },
    progress:
      r.p_next_review_at != null
        ? {
            card_id: r.id,
            deck_id: r.deck_id,
            ease_factor: r.p_ease_factor!,
            interval: r.p_interval!,
            repetitions: r.p_repetitions!,
            next_review_at: r.p_next_review_at,
            updated_at: r.p_updated_at!,
            synced_at: r.p_synced_at,
          }
        : null,
  }));
}

// ---------- stats ----------

export interface UserStats {
  totalWords: number;
  masteredWords: number;
  learningWords: number;
}

export async function getUserStats(lang?: string): Promise<UserStats> {
  const db = await getDb();
  const totalRow = await db.getFirstAsync<{ n: number }>(
    lang
      ? "SELECT COUNT(*) AS n FROM cards WHERE lang = ?"
      : "SELECT COUNT(*) AS n FROM cards",
    ...(lang ? [lang] : []),
  );
  const masteredRow = await db.getFirstAsync<{ n: number }>(
    lang
      ? `SELECT COUNT(*) AS n FROM user_card_progress p
           JOIN cards c ON c.id = p.card_id
          WHERE p.repetitions >= 5 AND c.lang = ?`
      : `SELECT COUNT(*) AS n FROM user_card_progress WHERE repetitions >= 5`,
    ...(lang ? [lang] : []),
  );
  const learningRow = await db.getFirstAsync<{ n: number }>(
    lang
      ? `SELECT COUNT(*) AS n FROM user_card_progress p
           JOIN cards c ON c.id = p.card_id
          WHERE p.repetitions > 0 AND p.repetitions < 5 AND c.lang = ?`
      : `SELECT COUNT(*) AS n FROM user_card_progress WHERE repetitions > 0 AND repetitions < 5`,
    ...(lang ? [lang] : []),
  );
  return {
    totalWords: totalRow?.n ?? 0,
    masteredWords: masteredRow?.n ?? 0,
    learningWords: learningRow?.n ?? 0,
  };
}

// ---------- pack versions ----------

export async function getActivePack(lang: string): Promise<PackVersionRow | null> {
  const db = await getDb();
  return db.getFirstAsync<PackVersionRow>(
    "SELECT * FROM pack_versions WHERE lang = ?",
    lang,
  );
}

export async function listInstalledPacks(): Promise<PackVersionRow[]> {
  const db = await getDb();
  return db.getAllAsync<PackVersionRow>("SELECT * FROM pack_versions ORDER BY lang");
}

export async function upsertPackVersion(row: PackVersionRow): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO pack_versions (lang, active_version, folder_path, installed_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(lang) DO UPDATE SET
       active_version = excluded.active_version,
       folder_path = excluded.folder_path,
       installed_at = excluded.installed_at`,
    row.lang,
    row.active_version,
    row.folder_path,
    row.installed_at,
  );
}

export async function deletePackVersion(lang: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM pack_versions WHERE lang = ?", lang);
}

// ---------- helpers ----------

function rowToCardWithProgress(r: ProgressRow & CardRow): CardWithProgress {
  return {
    card: {
      id: r.card_id,
      deck_id: r.deck_id,
      type: r.type,
      level: r.level,
      prompt: r.prompt,
      answer: r.answer,
      image_path: r.image_path,
      image_source: r.image_source,
      image_license: r.image_license,
      audio_path: r.audio_path,
      emoji: r.emoji,
      image_key: r.image_key,
      lang: r.lang,
      pack_version: r.pack_version,
    },
    progress: {
      card_id: r.card_id,
      deck_id: r.deck_id,
      ease_factor: r.ease_factor,
      interval: r.interval,
      repetitions: r.repetitions,
      next_review_at: r.next_review_at,
      updated_at: r.updated_at,
      synced_at: r.synced_at,
    },
  };
}
