import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
fs.mkdirSync(path.join(dataDir, 'uploads'), { recursive: true });

const db = new DatabaseSync(path.join(dataDir, 'db.sqlite'));

db.exec('PRAGMA foreign_keys = ON');

db.exec(`CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  password   TEXT    NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
)`);

db.exec(`CREATE TABLE IF NOT EXISTS documents (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT    NOT NULL,
  mime_type    TEXT    NOT NULL,
  file_path    TEXT    NOT NULL,
  size_bytes   INTEGER NOT NULL,
  body_text    TEXT,
  tags         TEXT    NOT NULL DEFAULT '',
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
)`);

db.exec(`CREATE TABLE IF NOT EXISTS courses (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  url         TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  notes       TEXT    NOT NULL DEFAULT '',
  tags        TEXT    NOT NULL DEFAULT '',
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
)`);

db.exec('CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id)');
db.exec('CREATE INDEX IF NOT EXISTS idx_courses_user ON courses(user_id)');

export default db;
