import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
fs.mkdirSync(path.join(dataDir, 'uploads'), { recursive: true });

const db = new DatabaseSync(path.join(dataDir, 'db.sqlite'));

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    password   TEXT    NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS documents (
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
  );

  CREATE TABLE IF NOT EXISTS courses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT    NOT NULL,
    url         TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    notes       TEXT    NOT NULL DEFAULT '',
    tags        TEXT    NOT NULL DEFAULT '',
    created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS docs_fts USING fts5(
    title,
    body,
    tokenize='porter unicode61'
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS courses_fts USING fts5(
    title,
    body,
    tags,
    tokenize='porter unicode61'
  );

  CREATE TRIGGER IF NOT EXISTS docs_fts_insert AFTER INSERT ON documents BEGIN
    INSERT INTO docs_fts(rowid, title, body)
    VALUES (NEW.id, NEW.title, COALESCE(NEW.body_text, ''));
  END;

  CREATE TRIGGER IF NOT EXISTS docs_fts_update AFTER UPDATE ON documents BEGIN
    DELETE FROM docs_fts WHERE rowid = OLD.id;
    INSERT INTO docs_fts(rowid, title, body)
    VALUES (NEW.id, NEW.title, COALESCE(NEW.body_text, ''));
  END;

  CREATE TRIGGER IF NOT EXISTS docs_fts_delete AFTER DELETE ON documents BEGIN
    DELETE FROM docs_fts WHERE rowid = OLD.id;
  END;

  CREATE TRIGGER IF NOT EXISTS courses_fts_insert AFTER INSERT ON courses BEGIN
    INSERT INTO courses_fts(rowid, title, body, tags)
    VALUES (NEW.id, NEW.title, NEW.description || ' ' || NEW.notes, NEW.tags);
  END;

  CREATE TRIGGER IF NOT EXISTS courses_fts_update AFTER UPDATE ON courses BEGIN
    DELETE FROM courses_fts WHERE rowid = OLD.id;
    INSERT INTO courses_fts(rowid, title, body, tags)
    VALUES (NEW.id, NEW.title, NEW.description || ' ' || NEW.notes, NEW.tags);
  END;

  CREATE TRIGGER IF NOT EXISTS courses_fts_delete AFTER DELETE ON courses BEGIN
    DELETE FROM courses_fts WHERE rowid = OLD.id;
  END;
`);

export default db;
