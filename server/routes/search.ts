import { Router } from 'express';
import db from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string' || !q.trim()) return res.json([]);

  const userId = req.session.userId!;
  const safeQuery = q.trim().replace(/["']/g, ' ').trim();
  if (!safeQuery) return res.json([]);

  const ftsQuery = safeQuery.split(/\s+/).filter(Boolean).map(t => `${t}*`).join(' OR ');

  try {
    const docResults = db.prepare(`
      SELECT 'document' AS item_type, d.id AS item_id, d.title,
             snippet(docs_fts, 1, '<mark>', '</mark>', '...', 20) AS excerpt
      FROM docs_fts
      JOIN documents d ON docs_fts.rowid = d.id
      WHERE docs_fts MATCH ? AND d.user_id = ?
      ORDER BY rank
      LIMIT 15
    `).all(ftsQuery, userId) as any[];

    const courseResults = db.prepare(`
      SELECT 'course' AS item_type, c.id AS item_id, c.title,
             snippet(courses_fts, 1, '<mark>', '</mark>', '...', 20) AS excerpt
      FROM courses_fts
      JOIN courses c ON courses_fts.rowid = c.id
      WHERE courses_fts MATCH ? AND c.user_id = ?
      ORDER BY rank
      LIMIT 10
    `).all(ftsQuery, userId) as any[];

    res.json([...docResults, ...courseResults].slice(0, 25));
  } catch {
    res.json([]);
  }
});

export default router;
