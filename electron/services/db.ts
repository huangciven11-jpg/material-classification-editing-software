import Database from 'better-sqlite3'
import { getDatabasePath } from './path-service.js'

type DbInstance = InstanceType<typeof Database>

let database: DbInstance | null = null

export function resetDb() {
  if (database) {
    database.close()
    database = null
  }
}

export function getDb(): DbInstance {
  if (database) {
    return database
  }

  database = new Database(getDatabasePath())
  database.pragma('journal_mode = WAL')

  database.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      label TEXT NOT NULL,
      status TEXT NOT NULL,
      progress INTEGER NOT NULL,
      current_step TEXT NOT NULL,
      current_file TEXT,
      eta_seconds INTEGER,
      error_message TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      source_path TEXT NOT NULL,
      duration_ms INTEGER NOT NULL,
      thumbnail_path TEXT,
      content_tags TEXT NOT NULL,
      visual_tags TEXT NOT NULL,
      style_tags TEXT NOT NULL,
      usage_tags TEXT NOT NULL,
      similar_group_id TEXT,
      quality_score REAL NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `)

  return database
}
