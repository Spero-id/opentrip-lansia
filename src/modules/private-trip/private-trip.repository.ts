import { db } from "@/shared/db";
import { privateTripRequests, privateTripProposals } from "./private-trip.schema";
import { eq, and, desc, sql, like } from "drizzle-orm";

export interface IPrivateTripRepository {
  create(data: typeof privateTripRequests.$inferInsert): Promise<typeof privateTripRequests.$inferSelect>;
  findByUserId(userId: string): Promise<(typeof privateTripRequests.$inferSelect)[]>;
  findById(id: string): Promise<typeof privateTripRequests.$inferSelect | null>;
  findAll(options?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<{ rows: (typeof privateTripRequests.$inferSelect)[]; total: number }>;
  updateStatus(id: string, status: string): Promise<typeof privateTripRequests.$inferSelect | null>;
  createProposal(data: typeof privateTripProposals.$inferInsert): Promise<typeof privateTripProposals.$inferSelect>;
  findProposalsByRequestId(requestId: string): Promise<(typeof privateTripProposals.$inferSelect)[]>;
  findProposalById(id: string): Promise<typeof privateTripProposals.$inferSelect | null>;
  updateProposalStatus(id: string, status: string): Promise<typeof privateTripProposals.$inferSelect | null>;
}

export const privateTripRepository: IPrivateTripRepository = {
  async create(data) {
    const [req] = await db.insert(privateTripRequests).values(data).returning();
    return req;
  },

  async findByUserId(userId) {
    return db.select().from(privateTripRequests).where(eq(privateTripRequests.userId, userId)).orderBy(desc(privateTripRequests.createdAt));
  },

  async findById(id) {
    const [req] = await db.select().from(privateTripRequests).where(eq(privateTripRequests.id, id)).limit(1);
    return req ?? null;
  },

  async findAll(options = {}) {
    const { status, search, limit = 20, offset = 0 } = options;
    const conditions = [];
    if (status) conditions.push(eq(privateTripRequests.status, status));
    if (search) conditions.push(like(privateTripRequests.title, `%${search}%`));

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(privateTripRequests).where(where);
    const rows = await db.select().from(privateTripRequests).where(where).orderBy(desc(privateTripRequests.submittedAt)).limit(limit).offset(offset);
    return { rows, total: Number(count) };
  },

  async updateStatus(id, status) {
    const [req] = await db.update(privateTripRequests).set({ status, updatedAt: new Date() }).where(eq(privateTripRequests.id, id)).returning();
    return req ?? null;
  },

  async createProposal(data) {
    const [prop] = await db.insert(privateTripProposals).values(data).returning();
    return prop;
  },

  async findProposalsByRequestId(requestId) {
    return db.select().from(privateTripProposals).where(eq(privateTripProposals.requestId, requestId)).orderBy(desc(privateTripProposals.createdAt));
  },

  async findProposalById(id) {
    const [prop] = await db.select().from(privateTripProposals).where(eq(privateTripProposals.id, id)).limit(1);
    return prop ?? null;
  },

  async updateProposalStatus(id, status) {
    const [prop] = await db.update(privateTripProposals).set({ status }).where(eq(privateTripProposals.id, id)).returning();
    return prop ?? null;
  },
};
