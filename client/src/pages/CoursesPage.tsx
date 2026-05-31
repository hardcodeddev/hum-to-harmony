import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Course } from '../types';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const navigate = useNavigate();

  const load = () => api.getCourses().then(setCourses).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.createCourse({ title, url, description, tags });
      setTitle(''); setUrl(''); setDescription(''); setTags('');
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Remove this course?')) return;
    await api.deleteCourse(id);
    load();
  };

  const hostname = (u: string) => {
    try { return new URL(u).hostname; } catch { return u; }
  };

  const allTags = [...new Set(courses.flatMap(c => c.tags.split(',').map(t => t.trim()).filter(Boolean)))];
  const filtered = filterTag
    ? courses.filter(c => c.tags.split(',').map(t => t.trim()).includes(filterTag))
    : courses;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Music Courses</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Course'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2 className="form-card-title">Add Course</h2>
          <form onSubmit={handleAdd} className="add-form">
            <div className="form-row">
              <label className="form-label">Title *</label>
              <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="form-row">
              <label className="form-label">URL *</label>
              <input type="url" className="form-input" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." required />
            </div>
            <div className="form-row">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="What topics does this course cover?" />
            </div>
            <div className="form-row">
              <label className="form-label">Tags</label>
              <input type="text" className="form-input" value={tags} onChange={e => setTags(e.target.value)} placeholder="jazz, drums, theory" />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button type="submit" className="btn-primary">Add Course</button>
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
          <p>No courses yet.</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>Add your first course</button>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map(c => (
            <div key={c.id} className="card" onClick={() => navigate(`/courses/${c.id}`)}>
              <div className="card-top-row">
                <span className="type-badge type-course">Course</span>
                <button className="card-delete-btn" onClick={e => handleDelete(e, c.id)} title="Remove">✕</button>
              </div>
              <div className="card-title">{c.title}</div>
              <div className="card-meta">{hostname(c.url)}</div>
              {c.description && (
                <div className="card-desc">
                  {c.description.length > 120 ? c.description.slice(0, 120) + '…' : c.description}
                </div>
              )}
              {c.tags && (
                <div className="card-tags">
                  {c.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
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
