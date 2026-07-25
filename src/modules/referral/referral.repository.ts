import { db } from "@/shared/db";
import { referrals, commissions, commissionRules, commissionPayouts } from "./referral.schema";
import { eq, desc } from "drizzle-orm";
import type { UUID } from "@/shared/types";

export interface IReferralRepository {
  createReferral(data: typeof referrals.$inferInsert): Promise<typeof referrals.$inferSelect>;
  findByReferrer(referrerId: UUID): Promise<(typeof referrals.$inferSelect)[]>;
  createCommission(data: typeof commissions.$inferInsert): Promise<typeof commissions.$inferSelect>;
  getCommissionsByAgent(agentId: UUID): Promise<(typeof commissions.$inferSelect)[]>;
  findAllCommissions(): Promise<(typeof commissions.$inferSelect)[]>;
  findCommissionById(id: UUID): Promise<typeof commissions.$inferSelect | null>;
  updateCommission(id: UUID, data: Partial<typeof commissions.$inferInsert>): Promise<void>;
  deleteCommission(id: UUID): Promise<void>;
}

export const referralRepository: IReferralRepository = {
  async createReferral(data) {
    const [ref] = await db.insert(referrals).values(data).returning();
    return ref;
  },

  async findByReferrer(referrerId) {
    return db.select().from(referrals).where(eq(referrals.referrerId, referrerId));
  },

  async createCommission(data) {
    const [comm] = await db.insert(commissions).values(data).returning();
    return comm;
  },

  async getCommissionsByAgent(agentId) {
    return db.select().from(commissions).where(eq(commissions.agentId, agentId));
  },

  async findAllCommissions() {
    return db.select().from(commissions).orderBy(desc(commissions.createdAt));
  },

  async findCommissionById(id) {
    const [comm] = await db.select().from(commissions).where(eq(commissions.id, id)).limit(1);
    return comm ?? null;
  },

  async updateCommission(id, data) {
    await db.update(commissions).set(data).where(eq(commissions.id, id));
  },

  async deleteCommission(id) {
    await db.delete(commissions).where(eq(commissions.id, id));
  },
};
