import { Router } from 'express';
import db from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const rows = db.prepare(
    'SELECT id, title, url, description, notes, tags, created_at, updated_at FROM courses WHERE user_id = ? ORDER BY updated_at DESC'
  ).all(req.session.userId!);
  res.json(rows);
});

router.post('/', (req, res) => {
  const userId = req.session.userId!;
  const { title, url, description = '', notes = '', tags = '' } = req.body;
  if (!title?.trim() || !url?.trim()) {
    return res.status(400).json({ error: 'Title and URL required' });
  }

  const result = db.prepare(
    'INSERT INTO courses (user_id, title, url, description, notes, tags) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(userId, title.trim(), url.trim(), description.trim(), notes.trim(), tags.trim());

  res.status(201).json({ id: Number(result.lastInsertRowid), title: title.trim(), url: url.trim() });
});

router.get('/:id', (req, res) => {
  const course = db.prepare(
    'SELECT * FROM courses WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.session.userId!) as any;
  if (!course) return res.status(404).json({ error: 'Not found' });
  res.json(course);
});

router.patch('/:id', (req, res) => {
  const userId = req.session.userId!;
  const exists = db.prepare('SELECT id FROM courses WHERE id = ? AND user_id = ?').get(req.params.id, userId);
  if (!exists) return res.status(404).json({ error: 'Not found' });

  const allowed = ['title', 'url', 'description', 'notes', 'tags'] as const;
  const updates: string[] = [];
  const values: any[] = [];

  for (const f of allowed) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      values.push(typeof req.body[f] === 'string' ? req.body[f].trim() : req.body[f]);
    }
  }
  if (updates.length === 0) return res.json({ ok: true });

  updates.push('updated_at = unixepoch()');
  values.push(req.params.id, userId);
  db.prepare(`UPDATE courses SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const userId = req.session.userId!;
  const result = db.prepare('DELETE FROM courses WHERE id = ? AND user_id = ?').run(req.params.id, userId);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;
