import { Router } from 'express';
import db from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

// Escape LIKE wildcards so user input is treated literally.
function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (c) => '\\' + c);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}

// Build a short, HTML-safe excerpt with matched terms wrapped in <mark>.
function buildExcerpt(text: string, terms: string[]): string {
  if (!text) return '';
  const lower = text.toLowerCase();
  let pos = -1;
  for (const t of terms) {
    const i = lower.indexOf(t);
    if (i !== -1 && (pos === -1 || i < pos)) pos = i;
  }
  if (pos === -1) pos = 0;

  const start = Math.max(0, pos - 40);
  const slice = text.slice(start, start + 240);
  let html = escapeHtml(slice);

  for (const t of terms) {
    const re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    html = html.replace(re, '<mark>$1</mark>');
  }

  return (start > 0 ? '…' : '') + html + (start + 240 < text.length ? '…' : '');
}

router.get('/', (req, res) => {
  const q = (req.query.q ?? '').toString().trim();
  if (!q) return res.json([]);

  const userId = req.session.userId!;
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8);
  if (terms.length === 0) return res.json([]);

  const likeParams = terms.map((t) => '%' + escapeLike(t) + '%');

  // Every term must appear (AND) somewhere in the row's searchable text.
  const docCond = terms
    .map(() => "(lower(title || ' ' || COALESCE(body_text, '') || ' ' || tags) LIKE ? ESCAPE '\\')")
    .join(' AND ');
  const docs = db
    .prepare(
      `SELECT id, title, body_text, tags FROM documents
       WHERE user_id = ? AND (${docCond})
       ORDER BY updated_at DESC LIMIT 15`
    )
    .all(userId, ...likeParams) as any[];

  const courseCond = terms
    .map(() => "(lower(title || ' ' || description || ' ' || notes || ' ' || tags) LIKE ? ESCAPE '\\')")
    .join(' AND ');
  const courses = db
    .prepare(
      `SELECT id, title, description, notes, tags FROM courses
       WHERE user_id = ? AND (${courseCond})
       ORDER BY updated_at DESC LIMIT 10`
    )
    .all(userId, ...likeParams) as any[];

  const results = [
    ...docs.map((d) => ({
      item_type: 'document' as const,
      item_id: d.id,
      title: d.title,
      excerpt: buildExcerpt(d.body_text || d.tags || '', terms),
    })),
    ...courses.map((c) => ({
      item_type: 'course' as const,
      item_id: c.id,
      title: c.title,
      excerpt: buildExcerpt([c.description, c.notes, c.tags].filter(Boolean).join(' '), terms),
    })),
  ];

  res.json(results.slice(0, 25));
});

export default router;
