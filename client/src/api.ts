import type { Document, Course, SearchResult, User } from './types';

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  getMe: () => request<User>('/auth/me'),
  login: (username: string, password: string) =>
    request<User>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (username: string, password: string) =>
    request<User>('/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),

  getDocuments: () => request<Document[]>('/documents'),
  uploadDocument: (formData: FormData) =>
    fetch(`${BASE}/documents`, { method: 'POST', credentials: 'include', body: formData }).then(async r => {
      if (!r.ok) {
        const err = await r.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(err.error || 'Upload failed');
      }
      return r.json();
    }),
  getDocument: (id: number) => request<Document>(`/documents/${id}`),
  patchDocument: (id: number, patch: Partial<Document & { body_text: string }>) =>
    request<{ ok: boolean }>(`/documents/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteDocument: (id: number) =>
    request<{ ok: boolean }>(`/documents/${id}`, { method: 'DELETE' }),
  getDocumentFileUrl: (id: number) => `/api/documents/${id}/file`,

  getCourses: () => request<Course[]>('/courses'),
  createCourse: (data: { title: string; url: string; description?: string; notes?: string; tags?: string }) =>
    request<{ id: number; title: string; url: string }>('/courses', { method: 'POST', body: JSON.stringify(data) }),
  getCourse: (id: number) => request<Course>(`/courses/${id}`),
  patchCourse: (id: number, patch: Partial<Course>) =>
    request<{ ok: boolean }>(`/courses/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteCourse: (id: number) =>
    request<{ ok: boolean }>(`/courses/${id}`, { method: 'DELETE' }),

  search: (q: string) => request<SearchResult[]>(`/search?q=${encodeURIComponent(q)}`),
};
