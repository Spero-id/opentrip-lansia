import { db } from "@/shared/db";
import { users } from "./auth.schema";
import { account } from "./better-auth.schema";
import { and, eq, desc } from "drizzle-orm";

export interface IAuthRepository {
  findById(id: string): Promise<typeof users.$inferSelect | null>;
  findByEmail(email: string): Promise<typeof users.$inferSelect | null>;
  findAll(): Promise<(typeof users.$inferSelect)[]>;
  update(id: string, data: Partial<typeof users.$inferInsert>): Promise<void>;
  delete(id: string): Promise<void>;
  getAccountPassword(userId: string): Promise<string | null>;
  updateAccountPassword(userId: string, password: string): Promise<void>;
}

export const authRepository: IAuthRepository = {
  async findById(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user ?? null;
  },

  async findByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user ?? null;
  },

  async findAll() {
    return db.select().from(users).orderBy(desc(users.createdAt));
  },

  async update(id, data) {
    await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id));
  },

  async delete(id) {
    await db.delete(users).where(eq(users.id, id));
  },

  async getAccountPassword(userId) {
    const [acc] = await db
      .select({ password: account.password })
      .from(account)
      .where(and(eq(account.userId, userId), eq(account.providerId, "credential")))
      .limit(1);
    return acc?.password ?? null;
  },

  async updateAccountPassword(userId, password) {
    await db
      .update(account)
      .set({ password, updatedAt: new Date() })
      .where(and(eq(account.userId, userId), eq(account.providerId, "credential")));
  },
};
