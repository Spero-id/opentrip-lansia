import { db } from "@/lib/db";
import { blogs, blogCategories } from "@/db/schema/blog";
import { eq, desc } from "drizzle-orm";
import type { UUID } from "@/types";

export interface IBlogRepository {
  findAllPublished(): Promise<(typeof blogs.$inferSelect)[]>;
  findAll(): Promise<(typeof blogs.$inferSelect)[]>;
  findById(id: UUID): Promise<typeof blogs.$inferSelect | null>;
  findBySlug(slug: string): Promise<typeof blogs.$inferSelect | null>;
  create(data: typeof blogs.$inferInsert): Promise<typeof blogs.$inferSelect>;
  update(id: UUID, data: Partial<typeof blogs.$inferInsert>): Promise<void>;
  delete(id: UUID): Promise<void>;
  listCategories(): Promise<(typeof blogCategories.$inferSelect)[]>;
  findCategoryById(id: UUID): Promise<typeof blogCategories.$inferSelect | null>;
  findCategoryBySlug(slug: string): Promise<typeof blogCategories.$inferSelect | null>;
  createCategory(data: typeof blogCategories.$inferInsert): Promise<typeof blogCategories.$inferSelect>;
  updateCategory(id: UUID, data: Partial<typeof blogCategories.$inferInsert>): Promise<void>;
  deleteCategory(id: UUID): Promise<void>;
  clearBlogsCategory(categoryId: UUID): Promise<void>;
}

export const blogRepository: IBlogRepository = {
  async findAllPublished() {
    return db.select().from(blogs).where(eq(blogs.status, "published")).orderBy(desc(blogs.createdAt));
  },

  async findAll() {
    return db.select().from(blogs).orderBy(desc(blogs.createdAt));
  },

  async findById(id) {
    const [blog] = await db.select().from(blogs).where(eq(blogs.id, id)).limit(1);
    return blog ?? null;
  },

  async findBySlug(slug) {
    const [blog] = await db.select().from(blogs).where(eq(blogs.slug, slug)).limit(1);
    return blog ?? null;
  },

  async create(data) {
    const [blog] = await db.insert(blogs).values(data).returning();
    return blog;
  },

  async update(id, data) {
    await db.update(blogs).set(data).where(eq(blogs.id, id));
  },

  async delete(id) {
    await db.delete(blogs).where(eq(blogs.id, id));
  },

  async listCategories() {
    return db.select().from(blogCategories).orderBy(blogCategories.name);
  },

  async findCategoryById(id) {
    const [row] = await db.select().from(blogCategories).where(eq(blogCategories.id, id)).limit(1);
    return row ?? null;
  },

  async findCategoryBySlug(slug) {
    const [row] = await db.select().from(blogCategories).where(eq(blogCategories.slug, slug)).limit(1);
    return row ?? null;
  },

  async createCategory(data) {
    const [row] = await db.insert(blogCategories).values(data).returning();
    return row;
  },

  async updateCategory(id, data) {
    await db.update(blogCategories).set(data).where(eq(blogCategories.id, id));
  },

  async deleteCategory(id) {
    await db.delete(blogCategories).where(eq(blogCategories.id, id));
  },

  async clearBlogsCategory(categoryId) {
    await db.update(blogs).set({ categoryId: null }).where(eq(blogs.categoryId, categoryId));
  },
};
