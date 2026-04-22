import * as SQLite from "expo-sqlite";
import type { SQLiteDatabase } from "expo-sqlite";
import { runMigrations } from "./migrations";

const DB_NAME = "dudulingo.db";

let _db: SQLiteDatabase | null = null;
let _opening: Promise<SQLiteDatabase> | null = null;

export async function getDb(): Promise<SQLiteDatabase> {
  if (_db) return _db;
  if (_opening) return _opening;

  _opening = (async () => {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.execAsync("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
    await runMigrations(db);
    _db = db;
    _opening = null;
    return db;
  })();

  return _opening;
}

export async function closeDb(): Promise<void> {
  if (_db) {
    await _db.closeAsync();
    _db = null;
  }
}

export async function resetDbForTests(): Promise<void> {
  if (_db) await _db.closeAsync();
  _db = null;
  _opening = null;
  await SQLite.deleteDatabaseAsync(DB_NAME).catch(() => undefined);
}
