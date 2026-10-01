import { db } from "@/shared/db";
import type { Tx } from "@/shared/db/utils";
import { loyaltyTransactions } from "@/db/schema/referral";
import { users } from "@/modules/auth/auth.schema";
import { eq, sql } from "drizzle-orm";
import type { UUID } from "@/shared/types";

type Target = typeof db | Tx;

export interface ILoyaltyRepository {
  createTransaction(
    data: typeof loyaltyTransactions.$inferInsert,
    target?: Target
  ): Promise<typeof loyaltyTransactions.$inferSelect>;
  updateLoyaltyPoints(userId: UUID, pointsToAdd: number, target?: Target): Promise<void>;
}

export const loyaltyRepository: ILoyaltyRepository = {
  async createTransaction(data, target = db) {
    const [txn] = await target.insert(loyaltyTransactions).values(data).returning();
    return txn;
  },

  async updateLoyaltyPoints(userId, pointsToAdd, target = db) {
    await target
      .update(users)
      .set({ loyaltyPoints: sql`${users.loyaltyPoints} + ${pointsToAdd}` })
      .where(eq(users.id, userId));
  },
};
