import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import type { Course } from '../types';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function CourseViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [notes, setNotes] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editTags, setEditTags] = useState('');
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const [saving, setSaving] = useState(false);

  const debouncedNotes = useDebounce(notes, 1200);

  useEffect(() => {
    if (!id) return;
    api.getCourse(Number(id))
      .then(c => {
        setCourse(c);
        setNotes(c.notes);
        setEditTitle(c.title);
        setEditTags(c.tags);
      })
      .catch(() => navigate('/courses'));
  }, [id]);

  useEffect(() => {
    if (!course || debouncedNotes === course.notes) return;
    setSaving(true);
    api.patchCourse(course.id, { notes: debouncedNotes }).finally(() => setSaving(false));
  }, [debouncedNotes]);

  const saveMeta = async () => {
    if (!course) return;
    if (editTitle !== course.title || editTags !== course.tags) {
      await api.patchCourse(course.id, { title: editTitle, tags: editTags });
    }
  };

  const hostname = (u: string) => {
    try { return new URL(u).hostname; } catch { return u; }
  };

  if (!course) {
    return <div className="page"><div className="loading">Loading…</div></div>;
  }

  return (
    <div className="page course-view-page">
      <div className="course-view-header">
        <Link to="/courses" className="back-link">← Courses</Link>
        <div className="course-meta-edit">
          <input
            className="course-title-input"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={saveMeta}
          />
          <input
            className="tags-input"
            placeholder="Tags"
            value={editTags}
            onChange={e => setEditTags(e.target.value)}
            onBlur={saveMeta}
          />
          <a
            href={course.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Open in new tab ↗
          </a>
        </div>
      </div>

      <div className="course-view-body">
        <div className="course-iframe-wrap">
          {iframeBlocked ? (
            <div className="iframe-blocked">
              <p>This site blocks embedding. Open it in a new tab instead.</p>
              <a href={course.url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Open {hostname(course.url)} →
              </a>
            </div>
          ) : (
            <iframe
              src={course.url}
              className="course-iframe"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              title={course.title}
              onError={() => setIframeBlocked(true)}
            />
          )}
        </div>

        <div className="course-notes-panel">
          <div className="notes-header">
            <h3>Notes</h3>
            {saving && <span className="saving-indicator">Saving…</span>}
          </div>
          <textarea
            className="notes-textarea"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Take notes about this course…&#10;&#10;Your notes are auto-saved and fully searchable."
          />
        </div>
      </div>
    </div>
  );
}
