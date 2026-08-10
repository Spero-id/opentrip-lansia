import { db } from "@/shared/db";
import { loyaltyTransactions } from "@/db/schema/referral";
import { users } from "@/modules/auth/auth.schema";
import { eq, sql } from "drizzle-orm";
import type { UUID } from "@/shared/types";

export interface ILoyaltyRepository {
  createTransaction(data: typeof loyaltyTransactions.$inferInsert): Promise<typeof loyaltyTransactions.$inferSelect>;
  updateLoyaltyPoints(userId: UUID, pointsToAdd: number): Promise<void>;
}

export const loyaltyRepository: ILoyaltyRepository = {
  async createTransaction(data) {
    const [txn] = await db.insert(loyaltyTransactions).values(data).returning();
    return txn;
  },

  async updateLoyaltyPoints(userId, pointsToAdd) {
    await db
      .update(users)
      .set({ loyaltyPoints: sql`${users.loyaltyPoints} + ${pointsToAdd}` })
      .where(eq(users.id, userId));
  },
};
