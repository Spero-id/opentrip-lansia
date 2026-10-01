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
}
