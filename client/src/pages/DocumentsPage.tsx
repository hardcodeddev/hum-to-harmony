import { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Document } from '../types';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function mimeLabel(mime: string) {
  if (mime === 'application/pdf') return 'PDF';
  if (mime === 'text/markdown') return 'MD';
  return 'TXT';
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const load = () => api.getDocuments().then(setDocs).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);
    if (title) fd.append('title', title);
    if (tags) fd.append('tags', tags);

    setUploading(true);
    setUploadError('');
    try {
      await api.uploadDocument(fd);
      setTitle('');
      setTags('');
      if (fileRef.current) fileRef.current.value = '';
      setShowUpload(false);
      load();
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Delete this document?')) return;
    await api.deleteDocument(id);
    load();
  };

  const allTags = [...new Set(docs.flatMap(d => d.tags.split(',').map(t => t.trim()).filter(Boolean)))];
  const filtered = filterTag
    ? docs.filter(d => d.tags.split(',').map(t => t.trim()).includes(filterTag))
    : docs;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Documents</h1>
        <button className="btn-primary" onClick={() => setShowUpload(!showUpload)}>
          {showUpload ? 'Cancel' : '+ Upload'}
        </button>
      </div>

      {showUpload && (
        <div className="form-card">
          <h2 className="form-card-title">Upload Document</h2>
          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-row">
              <label className="form-label">File (.txt, .md, .pdf)</label>
              <input ref={fileRef} type="file" accept=".txt,.md,.pdf" className="file-input" required />
            </div>
            <div className="form-row">
              <label className="form-label">Title (optional)</label>
              <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Leave blank to use filename" />
            </div>
            <div className="form-row">
              <label className="form-label">Tags</label>
              <input type="text" className="form-input" value={tags} onChange={e => setTags(e.target.value)} placeholder="jazz, theory, drums" />
            </div>
            {uploadError && <div className="error-msg">{uploadError}</div>}
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? 'Uploading…' : 'Upload Document'}
            </button>
          </form>
        </div>
      )}

      {allTags.length > 0 && (
        <div className="tag-filter">
          <button className={`tag-btn${!filterTag ? ' active' : ''}`} onClick={() => setFilterTag('')}>All</button>
          {allTags.map(t => (
            <button key={t} className={`tag-btn${filterTag === t ? ' active' : ''}`} onClick={() => setFilterTag(t)}>{t}</button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No documents yet.</p>
          <button className="btn-primary" onClick={() => setShowUpload(true)}>Upload your first document</button>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map(doc => (
            <div key={doc.id} className="card" onClick={() => navigate(`/documents/${doc.id}`)}>
              <div className="card-top-row">
                <span className={`type-badge type-${mimeLabel(doc.mime_type).toLowerCase()}`}>
                  {mimeLabel(doc.mime_type)}
                </span>
                <button
                  className="card-delete-btn"
                  onClick={e => handleDelete(e, doc.id)}
                  title="Delete"
                >✕</button>
              </div>
              <div className="card-title">{doc.title}</div>
              <div className="card-meta">{formatSize(doc.size_bytes)} · {formatDate(doc.created_at)}</div>
              {doc.tags && (
                <div className="card-tags">
                  {doc.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                    <span key={t} className="tag-pill">{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
