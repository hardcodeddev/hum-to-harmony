import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import type { SearchResult } from '../types';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const doSearch = async (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const r = await api.search(q);
      setResults(r);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setQuery(q); doSearch(q); }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
    doSearch(query);
  };

  const handleResultClick = (r: SearchResult) => {
    if (r.item_type === 'document') navigate(`/documents/${r.item_id}`);
    else navigate(`/courses/${r.item_id}`);
  };

  return (
    <div className="page search-page">
      <div className="page-header">
        <h1 className="page-title">Search</h1>
      </div>

      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="search"
          className="search-input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search across documents and courses…"
          autoFocus
        />
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {loading && <div className="loading">Searching…</div>}

      {!loading && searched && results.length === 0 && (
        <div className="empty-state">No results for "{query}".</div>
      )}

      {results.length > 0 && (
        <div className="search-results">
          <div className="results-count">{results.length} result{results.length !== 1 ? 's' : ''}</div>
          {results.map((r, i) => (
            <div key={i} className="search-result-card" onClick={() => handleResultClick(r)}>
              <div className="result-top">
                <span className={`type-badge type-${r.item_type}`}>
                  {r.item_type === 'document' ? 'Document' : 'Course'}
                </span>
                <span className="result-title">{r.title}</span>
              </div>
              {r.excerpt && (
                <div
                  className="result-excerpt"
                  dangerouslySetInnerHTML={{ __html: r.excerpt }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
