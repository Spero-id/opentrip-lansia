import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";

export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscribeSchema = z.object({
  email: z.string().email("Email tidak valid").max(255),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type Subscriber = typeof subscribers.$inferSelect;