import { pgTable, uuid, varchar, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";

export const promotions = pgTable("promotions", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }),
  type: varchar("type", { length: 20 }).notNull(),
  value: varchar("value", { length: 50 }).notNull(),
  minPurchase: varchar("min_purchase", { length: 50 }),
  maxDiscount: varchar("max_discount", { length: 50 }),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").default(0),
  usageLimitPerUser: integer("usage_limit_per_user"),
  validFrom: date("valid_from"),
  validUntil: date("valid_until"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const promotionUsages = pgTable("promotion_usages", {
  id: uuid("id").primaryKey().defaultRandom(),
  promotionId: uuid("promotion_id").notNull().references(() => promotions.id),
  userId: text("user_id").notNull(),
  bookingId: uuid("booking_id").notNull().unique(),
  usedAt: timestamp("used_at").defaultNow().notNull(),
});
