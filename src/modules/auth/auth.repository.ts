import { db } from "@/shared/db";
import { users } from "./auth.schema";
import { eq, desc } from "drizzle-orm";

export interface IAuthRepository {
  findById(id: string): Promise<typeof users.$inferSelect | null>;
  findByEmail(email: string): Promise<typeof users.$inferSelect | null>;
  findAll(): Promise<(typeof users.$inferSelect)[]>;
  update(id: string, data: Partial<typeof users.$inferInsert>): Promise<void>;
  delete(id: string): Promise<void>;
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
};
