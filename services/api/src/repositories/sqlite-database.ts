import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

type CourseMindSqliteGlobal = typeof globalThis & {
  __coursemindSqliteDatabase?: DatabaseSync;
};

const defaultDatabasePath = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../data/coursemind.sqlite");

function resolveDatabasePath() {
  return process.env.COURSEMIND_SQLITE_PATH ?? defaultDatabasePath;
}

function createDatabase() {
  const databasePath = resolveDatabasePath();

  mkdirSync(dirname(databasePath), { recursive: true });

  const database = new DatabaseSync(databasePath);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      role TEXT NOT NULL,
      messages_json TEXT NOT NULL,
      citations_json TEXT NOT NULL,
      rag_trace_json TEXT NOT NULL,
      model_trace_json TEXT NOT NULL,
      review_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS teacher_review_items (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      course_json TEXT NOT NULL,
      answer_message_json TEXT NOT NULL,
      citations_json TEXT NOT NULL,
      rag_trace_json TEXT NOT NULL,
      model_trace_json TEXT NOT NULL,
      review_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      severity TEXT NOT NULL,
      occurred_at TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      actor_user_id TEXT,
      course_id TEXT,
      conversation_id TEXT,
      target_type TEXT NOT NULL,
      target_id TEXT,
      summary TEXT NOT NULL,
      metadata_json TEXT
    );

    CREATE TABLE IF NOT EXISTS course_documents (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      source_type TEXT NOT NULL,
      visibility TEXT NOT NULL,
      ingestion_status TEXT NOT NULL,
      original_file_name TEXT,
      mime_type TEXT,
      size_bytes INTEGER,
      storage_path TEXT,
      uploaded_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS conversations_updated_at_idx ON conversations(updated_at);
    CREATE INDEX IF NOT EXISTS teacher_review_items_created_at_idx ON teacher_review_items(created_at);
    CREATE INDEX IF NOT EXISTS audit_events_occurred_at_idx ON audit_events(occurred_at);
    CREATE INDEX IF NOT EXISTS course_documents_course_id_idx ON course_documents(course_id);
  `);

  return database;
}

export function getSqliteDatabase() {
  const sqliteGlobal = globalThis as CourseMindSqliteGlobal;
  sqliteGlobal.__coursemindSqliteDatabase ??= createDatabase();

  return sqliteGlobal.__coursemindSqliteDatabase;
}

export function stringifyJson(value: unknown) {
  return JSON.stringify(value);
}

export function parseJson<T>(value: string) {
  return JSON.parse(value) as T;
}
