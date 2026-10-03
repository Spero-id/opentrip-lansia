import { blogRepository } from "./blog.repository";
import { blogs } from "@/db/schema/blog";
import { sanitizeBlogContent } from "@/utils/sanitize";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";
import type { UUID } from "@/types";
import { auditService, diffFields, pickFields } from "@/features/audit";

const BLOG_AUDIT_FIELDS = ["title", "slug", "status", "categoryId", "tags"] as const;
const CATEGORY_AUDIT_FIELDS = ["name", "slug", "description"] as const;

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

async function ensureUniqueCategorySlug(base: string): Promise<string> {
  let slug = base || "kategori";
  let n = 2;
  while (await blogRepository.findCategoryBySlug(slug)) {
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

    const created = await blogRepository.create({
      title: data.title,
      slug,
      content: data.content ? sanitizeBlogContent(data.content) : null,
      excerpt: data.excerpt ? sanitizeBlogContent(data.excerpt) : null,
      authorId: authorId as UUID,
      categoryId: data.categoryId || null,
      coverImageId: data.coverImageId ?? null,
      coverImage: data.coverImage ? data.coverImage : null,
      tags: data.tags ?? null,
      status: data.status || "draft",
      publishedAt,
    });
    await auditService.record({
      adminId: authorId ?? null,
      action: "create",
      entityType: "blog",
      entityId: created.id,
      newValues: pickFields(created, BLOG_AUDIT_FIELDS),
      description: `Artikel "${created.title}" dibuat`,
    });
    return created;
  },

  async updateBlog(id: UUID, data: Partial<BlogInsert>, adminId?: string | null) {
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
      categoryId: data.categoryId !== undefined ? data.categoryId || null : existing.categoryId,
      coverImageId: data.coverImageId !== undefined ? data.coverImageId : existing.coverImageId,
      coverImage: data.coverImage !== undefined ? (data.coverImage || null) : existing.coverImage,
      tags: data.tags !== undefined ? data.tags : existing.tags,
      status: data.status ?? existing.status,
      publishedAt,
      updatedAt: new Date(),
    });

    const after = await blogRepository.findById(id);
    const changes = diffFields(existing, after, BLOG_AUDIT_FIELDS);
    if (Object.keys(changes).length > 0) {
      await auditService.record({
        adminId: adminId ?? null,
        action: "update",
        entityType: "blog",
        entityId: id,
        oldValues: pickFields(existing, BLOG_AUDIT_FIELDS),
        newValues: changes,
        description: `Artikel "${after?.title ?? id}" diperbarui`,
      });
    }
    return after;
  },

  async deleteBlog(id: UUID, adminId?: string | null) {
    const existing = await blogRepository.findById(id);
    await blogRepository.delete(id);
    if (existing) {
      await auditService.record({
        adminId: adminId ?? null,
        action: "delete",
        entityType: "blog",
        entityId: id,
        oldValues: pickFields(existing, BLOG_AUDIT_FIELDS),
        newValues: null,
        description: `Artikel "${existing.title}" dihapus`,
      });
    }
  },

  async getCategories() {
    return blogRepository.listCategories();
  },

  async createCategory(data: { name: string; description?: string | null; adminId?: string | null }) {
    const name = (data.name || "").trim();
    if (!name) {
      throw new ValidationError("Nama kategori wajib diisi");
    }
    const slug = await ensureUniqueCategorySlug(slugify(name));
    const created = await blogRepository.createCategory({
      name,
      slug,
      description: data.description?.trim() || null,
    });
    await auditService.record({
      adminId: data.adminId ?? null,
      action: "create",
      entityType: "blog_category",
      entityId: created.id,
      newValues: pickFields(created, CATEGORY_AUDIT_FIELDS),
      description: `Kategori "${created.name}" dibuat`,
    });
    return created;
  },

  async deleteCategory(id: UUID, adminId?: string | null) {
    const existing = await blogRepository.findCategoryById(id);
    if (!existing) throw new NotFoundError("Kategori");
    await blogRepository.clearBlogsCategory(id);
    await blogRepository.deleteCategory(id);
    await auditService.record({
      adminId: adminId ?? null,
      action: "delete",
      entityType: "blog_category",
      entityId: id,
      oldValues: pickFields(existing, CATEGORY_AUDIT_FIELDS),
      newValues: null,
      description: `Kategori "${existing.name}" dihapus`,
    });
  },

  async updateCategory(id: UUID, data: { name?: string; description?: string | null; adminId?: string | null }) {
    const existing = await blogRepository.findCategoryById(id);
    if (!existing) return null;
    const patch: { name?: string; slug?: string; description?: string | null } = {};
    if (data.name !== undefined) {
      const name = data.name.trim();
      if (!name) throw new ValidationError("Nama kategori wajib diisi");
      patch.name = name;
      if (name !== existing.name) patch.slug = await ensureUniqueCategorySlug(slugify(name));
    }
    if (data.description !== undefined) patch.description = data.description?.trim() || null;
    await blogRepository.updateCategory(id, patch);
    const after = await blogRepository.findCategoryById(id);
    const changes = diffFields(existing, after, CATEGORY_AUDIT_FIELDS);
    if (Object.keys(changes).length > 0) {
      await auditService.record({
        adminId: data.adminId ?? null,
        action: "update",
        entityType: "blog_category",
        entityId: id,
        oldValues: pickFields(existing, CATEGORY_AUDIT_FIELDS),
        newValues: changes,
        description: `Kategori "${after?.name ?? id}" diperbarui`,
      });
    }
    return after;
  },
};
