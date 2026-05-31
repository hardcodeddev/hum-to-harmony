import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { marked } from 'marked';
import { api } from '../api';
import type { Document } from '../types';

export default function DocumentViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<Document | null>(null);
  const [content, setContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editTags, setEditTags] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.getDocument(Number(id))
      .then(d => {
        setDoc(d);
        setEditTitle(d.title);
        setEditTags(d.tags);
      })
      .catch(() => navigate('/'));
  }, [id]);

  useEffect(() => {
    if (!doc || doc.mime_type === 'application/pdf') return;
    fetch(api.getDocumentFileUrl(doc.id), { credentials: 'include' })
      .then(r => r.text())
      .then(setContent)
      .catch(() => {});
  }, [doc]);

  const save = async () => {
    if (!doc) return;
    setSaving(true);
    try {
      await api.patchDocument(doc.id, { title: editTitle, tags: editTags });
    } finally {
      setSaving(false);
    }
  };

  if (!doc) {
    return <div className="page"><div className="loading">Loading…</div></div>;
  }

  const fileUrl = api.getDocumentFileUrl(doc.id);

  return (
    <div className="page doc-view-page">
      <div className="doc-view-header">
        <Link to="/" className="back-link">← Documents</Link>
        <div className="doc-meta-edit">
          <input
            className="doc-title-input"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={save}
          />
          <input
            className="tags-input"
            placeholder="Tags (comma separated)"
            value={editTags}
            onChange={e => setEditTags(e.target.value)}
            onBlur={save}
          />
          {saving && <span className="saving-indicator">Saving…</span>}
        </div>
      </div>

      <div className="doc-content">
        {doc.mime_type === 'application/pdf' ? (
          <iframe
            src={fileUrl}
            className="pdf-viewer"
            title={doc.title}
          />
        ) : doc.mime_type === 'text/markdown' ? (
          <div
            className="markdown-body"
            dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }}
          />
        ) : (
          <pre className="text-body">{content}</pre>
        )}
      </div>
    </div>
  );
}
