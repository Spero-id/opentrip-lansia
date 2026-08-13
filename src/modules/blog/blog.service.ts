import { blogRepository } from "./blog.repository";
import { blogs } from "./blog.schema";
import { sanitizeBlogContent } from "@/shared/utils/sanitize";
import type { UUID } from "@/shared/types";

type BlogInsert = typeof blogs.$inferInsert;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function ensureUniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 2;
  while (await blogRepository.findBySlug(slug)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export const blogService = {
  async getPublishedBlogs() {
    return blogRepository.findAllPublished();
  },

  async getBlogBySlug(slug: string) {
    return blogRepository.findBySlug(slug);
  },

  async createBlog(data: BlogInsert, authorId: string) {
    const slug = await ensureUniqueSlug(slugify(data.slug || data.title || ""));
    const publishedAt =
      data.status === "published" ? data.publishedAt ?? new Date() : data.publishedAt ?? null;

    return blogRepository.create({
      title: data.title,
      slug,
      content: data.content ? sanitizeBlogContent(data.content) : null,
      excerpt: data.excerpt ? sanitizeBlogContent(data.excerpt) : null,
      authorId: authorId as UUID,
      categoryId: data.categoryId ?? null,
      coverImageId: data.coverImageId ?? null,
      tags: data.tags ?? null,
      status: data.status || "draft",
      publishedAt,
    });
  },

  async updateBlog(id: UUID, data: Partial<BlogInsert>) {
    const existing = await blogRepository.findById(id);
    if (!existing) return null;

    let slug = data.slug?.trim() ? slugify(data.slug) : existing.slug;
    if (slug !== existing.slug) {
      slug = await ensureUniqueSlug(slug);
    }
    const publishedAt =
      data.status === "published"
        ? data.publishedAt ?? existing.publishedAt ?? new Date()
        : data.publishedAt ?? existing.publishedAt;

    await blogRepository.update(id, {
      title: data.title ?? existing.title,
      slug,
      content: data.content !== undefined ? sanitizeBlogContent(data.content) : existing.content,
      excerpt: data.excerpt !== undefined ? sanitizeBlogContent(data.excerpt) : existing.excerpt,
      categoryId: data.categoryId !== undefined ? data.categoryId : existing.categoryId,
      coverImageId: data.coverImageId !== undefined ? data.coverImageId : existing.coverImageId,
      tags: data.tags !== undefined ? data.tags : existing.tags,
      status: data.status ?? existing.status,
      publishedAt,
      updatedAt: new Date(),
    });

    return blogRepository.findById(id);
  },
};
