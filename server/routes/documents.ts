import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import db from '../db';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const rows = db.prepare(
    'SELECT id, title, mime_type, size_bytes, tags, created_at, updated_at FROM documents WHERE user_id = ? ORDER BY updated_at DESC'
  ).all(req.session.userId!);
  res.json(rows);
});

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const userId = req.session.userId!;
  const { title, tags = '' } = req.body;
  const { originalname, size, path: filePath } = req.file;

  const ext = path.extname(originalname).toLowerCase();
  const docTitle = title?.trim() || path.parse(originalname).name;
  const mime = ext === '.md' ? 'text/markdown' : ext === '.pdf' ? 'application/pdf' : 'text/plain';
  const relativePath = path.relative(process.cwd(), filePath);

  let bodyText: string | null = null;
  if (ext === '.txt' || ext === '.md') {
    try { bodyText = fs.readFileSync(filePath, 'utf-8'); } catch {}
  }

  const result = db.prepare(
    'INSERT INTO documents (user_id, title, mime_type, file_path, size_bytes, body_text, tags) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(userId, docTitle, mime, relativePath, size, bodyText, tags.trim());

  res.status(201).json({ id: Number(result.lastInsertRowid), title: docTitle, mime_type: mime, size_bytes: size, tags: tags.trim() });
});

router.get('/:id', (req, res) => {
  const doc = db.prepare(
    'SELECT id, title, mime_type, size_bytes, tags, body_text, created_at, updated_at FROM documents WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.session.userId!) as any;
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
});

router.get('/:id/file', (req, res) => {
  const doc = db.prepare(
    'SELECT file_path, mime_type FROM documents WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.session.userId!) as any;
  if (!doc) return res.status(404).json({ error: 'Not found' });

  const absPath = path.resolve(process.cwd(), doc.file_path);
  res.setHeader('Content-Type', doc.mime_type);
  res.sendFile(absPath);
});

router.patch('/:id', (req, res) => {
  const userId = req.session.userId!;
  const exists = db.prepare('SELECT id FROM documents WHERE id = ? AND user_id = ?').get(req.params.id, userId);
  if (!exists) return res.status(404).json({ error: 'Not found' });

  const allowed = ['title', 'tags', 'body_text'] as const;
  const updates: string[] = [];
  const values: any[] = [];

  for (const f of allowed) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      values.push(req.body[f]);
    }
  }
  if (updates.length === 0) return res.json({ ok: true });

  updates.push('updated_at = unixepoch()');
  values.push(req.params.id, userId);
  db.prepare(`UPDATE documents SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const userId = req.session.userId!;
  const doc = db.prepare('SELECT file_path FROM documents WHERE id = ? AND user_id = ?').get(req.params.id, userId) as any;
  if (!doc) return res.status(404).json({ error: 'Not found' });

  db.prepare('DELETE FROM documents WHERE id = ? AND user_id = ?').run(req.params.id, userId);
  try { fs.unlinkSync(path.resolve(process.cwd(), doc.file_path)); } catch {}
  res.json({ ok: true });
});

export default router;
