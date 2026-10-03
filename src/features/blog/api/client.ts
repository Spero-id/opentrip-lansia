import type { BlogCategory, BlogPost } from "@/features/blog/types";

export const BLOG_DATE_LOCALE = "id-ID";

export function formatBlogDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString(BLOG_DATE_LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function findPostBySlug(posts: BlogPost[], slug: string): BlogPost | null {
  return posts.find((b) => b.slug === slug) ?? null;
}

export async function fetchPublishedBlogs(): Promise<BlogPost[]> {
  try {
    const res = await fetch("/api/blogs?published=1");
    const data: unknown = await res.json();
    return Array.isArray(data) ? (data as BlogPost[]) : [];
  } catch {
    return [];
  }
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await fetchPublishedBlogs();
  return findPostBySlug(posts, slug);
}

export async function fetchBlogCategories(): Promise<BlogCategory[]> {
  try {
    const res = await fetch("/api/blog-categories");
    const data: unknown = await res.json();
    return Array.isArray(data) ? (data as BlogCategory[]) : [];
  } catch {
    return [];
  }
}
