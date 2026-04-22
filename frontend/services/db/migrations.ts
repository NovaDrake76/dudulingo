import type { SQLiteDatabase } from "expo-sqlite";

export interface Migration {
  version: number;
  name: string;
  up: string;
}

export const MIGRATIONS: Migration[] = [
  {
    version: 4,
    name: "add-review-events",
    up: `
      CREATE TABLE IF NOT EXISTS review_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id TEXT NOT NULL,
        deck_id TEXT NOT NULL,
        reviewed_at INTEGER NOT NULL,
        rating TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_review_events_at ON review_events(reviewed_at);
      CREATE INDEX IF NOT EXISTS idx_review_events_deck ON review_events(deck_id, reviewed_at);

      INSERT INTO review_events (card_id, deck_id, reviewed_at, rating)
      SELECT card_id, deck_id, updated_at, NULL
      FROM user_card_progress;
    `,
  },
  {
    version: 3,
    name: "add-image-key-to-cards",
    up: `ALTER TABLE cards ADD COLUMN image_key TEXT;`,
  },
  {
    version: 2,
    name: "add-emoji-to-cards",
    up: `ALTER TABLE cards ADD COLUMN emoji TEXT;`,
  },
  {
    version: 1,
    name: "initial",
    up: `
      CREATE TABLE IF NOT EXISTS decks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        lang TEXT,
        pack_version INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        deck_id TEXT NOT NULL REFERENCES decks(id),
        type TEXT NOT NULL,
        level INTEGER NOT NULL DEFAULT 1,
        prompt TEXT,
        answer TEXT NOT NULL,
        image_path TEXT,
        image_source TEXT,
        image_license TEXT,
        audio_path TEXT,
        lang TEXT,
        pack_version INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_cards_deck ON cards(deck_id);
      CREATE INDEX IF NOT EXISTS idx_cards_lang ON cards(lang);

      CREATE TABLE IF NOT EXISTS user_card_progress (
        card_id TEXT PRIMARY KEY,
        deck_id TEXT NOT NULL,
        ease_factor REAL NOT NULL DEFAULT 2.5,
        interval INTEGER NOT NULL DEFAULT 0,
        repetitions INTEGER NOT NULL DEFAULT 0,
        next_review_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        synced_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_progress_due ON user_card_progress(next_review_at);
      CREATE INDEX IF NOT EXISTS idx_progress_dirty ON user_card_progress(synced_at) WHERE synced_at IS NULL;

      CREATE TABLE IF NOT EXISTS pack_versions (
        lang TEXT PRIMARY KEY,
        active_version INTEGER NOT NULL,
        folder_path TEXT NOT NULL,
        installed_at INTEGER NOT NULL
      );
    `,
  },
];

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS _migrations (
       version INTEGER PRIMARY KEY,
       name TEXT NOT NULL,
       applied_at INTEGER NOT NULL
     );`,
  );

  const applied = await db.getAllAsync<{ version: number }>(
    "SELECT version FROM _migrations",
  );
  const appliedSet = new Set(applied.map((r) => r.version));

  const sorted = [...MIGRATIONS].sort((a, b) => a.version - b.version);
  for (const m of sorted) {
    if (appliedSet.has(m.version)) continue;
    await db.withTransactionAsync(async () => {
      await db.execAsync(m.up);
      await db.runAsync(
        "INSERT INTO _migrations (version, name, applied_at) VALUES (?, ?, ?)",
        m.version,
        m.name,
        Date.now(),
      );
    });
  }
}
