import { db } from "@/shared/db";
import { contactMessages } from "./contact.schema";

export interface IContactRepository {
  create(data: typeof contactMessages.$inferInsert): Promise<typeof contactMessages.$inferSelect>;
}

export const contactRepository: IContactRepository = {
  async create(data) {
    const [msg] = await db.insert(contactMessages).values(data).returning();
    return msg;
  },
};
