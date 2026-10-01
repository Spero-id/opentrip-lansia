import { pgTable, uuid, text, varchar, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    type: varchar("type", { length: 30 }).notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    readAt: timestamp("read_at"),
    link: varchar("link", { length: 500 }),
  },
  (table) => ({
    userIsReadCreatedIdx: index("idx_notifications_user_isread_created").on(
      table.userId,
      table.isRead,
      table.createdAt
    ),
    userCreatedIdx: index("idx_notifications_user_created").on(table.userId, table.createdAt),
    typeIdx: index("idx_notifications_type").on(table.type),
    createdAtIdx: index("idx_notifications_created_at").on(table.createdAt),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
