export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  coverImage?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  status?: string;
  categoryId?: string | null;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}
