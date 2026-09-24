import { db } from "@/shared/db";
import { subscribers, type Subscriber } from "./newsletter.schema";
import { eq } from "drizzle-orm";

export interface ISubscriberRepository {
  findByEmail(email: string): Promise<Subscriber | undefined>;
  create(data: typeof subscribers.$inferInsert): Promise<Subscriber>;
}

export const subscriberRepository: ISubscriberRepository = {
  async findByEmail(email) {
    const result = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email))
      .limit(1);
    return result[0];
  },
  async create(data) {
    const [sub] = await db.insert(subscribers).values(data).returning();
    return sub;
  },
};