import { db } from "@/shared/db";
import { users } from "./auth.schema";
import { eq } from "drizzle-orm";
import type { UUID } from "@/shared/types";

export interface IAuthRepository {
  findById(id: string): Promise<typeof users.$inferSelect | null>;
  findByEmail(email: string): Promise<typeof users.$inferSelect | null>;
  update(id: string, data: Partial<typeof users.$inferInsert>): Promise<void>;
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

  async update(id, data) {
    await db.update(users).set(data).where(eq(users.id, id));
  },
};
