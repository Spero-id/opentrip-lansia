import { db } from "@/shared/db";
import { reviews } from "./review.schema";
import { eq, desc } from "drizzle-orm";
import type { UUID } from "@/shared/types";

export interface IReviewRepository {
  findAll(): Promise<(typeof reviews.$inferSelect)[]>;
  findById(id: UUID): Promise<typeof reviews.$inferSelect | null>;
  create(data: typeof reviews.$inferInsert): Promise<typeof reviews.$inferSelect>;
  findByTripId(tripId: UUID): Promise<(typeof reviews.$inferSelect)[]>;
  update(id: UUID, data: Partial<typeof reviews.$inferInsert>): Promise<void>;
  delete(id: UUID): Promise<void>;
}

export const reviewRepository: IReviewRepository = {
  async findAll() {
    return db.select().from(reviews).orderBy(desc(reviews.createdAt));
  },

  async findById(id) {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
    return review ?? null;
  },

  async create(data) {
    const [review] = await db.insert(reviews).values(data).returning();
    return review;
  },

  async findByTripId(tripId) {
    return db.select().from(reviews).where(eq(reviews.tripId, tripId));
  },

  async update(id, data) {
    await db.update(reviews).set(data).where(eq(reviews.id, id));
  },

  async delete(id) {
    await db.delete(reviews).where(eq(reviews.id, id));
  },
};
