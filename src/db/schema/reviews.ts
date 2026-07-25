import { pgTable, uuid, varchar, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").notNull().unique(),
  userId: uuid("user_id").notNull(),
  tripId: uuid("trip_id").notNull(),
  departureId: uuid("departure_id"),
  rating: integer("rating").notNull(),
  content: text("content"),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  isFeatured: boolean("is_featured").default(false),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviewMedia = pgTable("review_media", {
  reviewId: uuid("review_id").notNull().references(() => reviews.id),
  mediaId: uuid("media_id").notNull(),
  sortOrder: integer("sort_order").default(0),
});
