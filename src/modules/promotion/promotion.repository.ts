import { db } from "@/shared/db";
import { promotions, promotionUsages } from "./promotion.schema";
import { eq, and, desc, sql } from "drizzle-orm";
import type { UUID } from "@/shared/types";

export interface IPromotionRepository {
  findAll(): Promise<(typeof promotions.$inferSelect)[]>;
  findById(id: UUID): Promise<typeof promotions.$inferSelect | null>;
  findByCode(code: string): Promise<typeof promotions.$inferSelect | null>;
  create(data: typeof promotions.$inferInsert): Promise<typeof promotions.$inferSelect>;
  update(id: UUID, data: Partial<typeof promotions.$inferInsert>): Promise<void>;
  delete(id: UUID): Promise<void>;
  incrementUsage(id: UUID): Promise<void>;
  recordUsage(promotionId: UUID, userId: UUID, bookingId: UUID): Promise<void>;
}

export const promotionRepository: IPromotionRepository = {
  async findAll() {
    return db.select().from(promotions).orderBy(desc(promotions.createdAt));
  },

  async findById(id) {
    const [promo] = await db.select().from(promotions).where(eq(promotions.id, id)).limit(1);
    return promo ?? null;
  },

  async findByCode(code) {
    const [promo] = await db
      .select()
      .from(promotions)
      .where(and(eq(promotions.code, code), eq(promotions.isActive, true)))
      .limit(1);
    return promo ?? null;
  },

  async create(data) {
    const [promo] = await db.insert(promotions).values(data).returning();
    return promo;
  },

  async update(id, data) {
    await db.update(promotions).set(data).where(eq(promotions.id, id));
  },

  async delete(id) {
    await db.delete(promotions).where(eq(promotions.id, id));
  },

  async incrementUsage(id) {
    await db
      .update(promotions)
      .set({ usageCount: sql`${promotions.usageCount} + 1` })
      .where(eq(promotions.id, id));
  },

  async recordUsage(promotionId, userId, bookingId) {
    await db.insert(promotionUsages).values({ promotionId, userId, bookingId });
  },
};
