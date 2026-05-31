export interface User {
  id: number;
  username: string;
}

export interface Document {
  id: number;
  title: string;
  mime_type: string;
  size_bytes: number;
  tags: string;
  body_text?: string | null;
  created_at: number;
  updated_at: number;
}

export interface Course {
  id: number;
  title: string;
  url: string;
  description: string;
  notes: string;
  tags: string;
  created_at: number;
  updated_at: number;
}

export interface SearchResult {
  item_type: 'document' | 'course';
  item_id: number;
  title: string;
  excerpt: string;
}
