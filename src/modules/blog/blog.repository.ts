import { db } from "@/shared/db";
import { blogs, blogCategories } from "./blog.schema";
import { eq, desc } from "drizzle-orm";
import type { UUID } from "@/shared/types";

export interface IBlogRepository {
  findAllPublished(): Promise<(typeof blogs.$inferSelect)[]>;
  findAll(): Promise<(typeof blogs.$inferSelect)[]>;
  findById(id: UUID): Promise<typeof blogs.$inferSelect | null>;
  findBySlug(slug: string): Promise<typeof blogs.$inferSelect | null>;
  create(data: typeof blogs.$inferInsert): Promise<typeof blogs.$inferSelect>;
  update(id: UUID, data: Partial<typeof blogs.$inferInsert>): Promise<void>;
  delete(id: UUID): Promise<void>;
}

export const blogRepository: IBlogRepository = {
  async findAllPublished() {
    return db.select().from(blogs).where(eq(blogs.status, "published")).orderBy(desc(blogs.publishedAt));
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
};
