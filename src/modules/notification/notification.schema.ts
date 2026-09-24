import { pgTable, uuid, text, varchar, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "../auth/auth.schema";

/**
 * notifications — MVP admin notifications
 *
 * Scope MVP triggers:
 * 1. payment_proof        — bukti pembayaran diupload (payments.proofUrl)
 * 2. private_trip_request — request private trip baru (private_trip_requests)
 * 3. participant_added    — penambahan peserta baru pada open/destinasi trip (booking_participants)
 *
 * Spec kolom:
 * - id, user_id, title, message, type, is_read, created_at, read_at, link (navigasi)
 * user_id = admin penerima notifikasi (FK users.id, role=admin)
 * link = href admin yang relevan, dipakai saat klik notifikasi
 */
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    // MVP types: payment_proof | private_trip_request | participant_added
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

/** Allowed MVP notification types — keep in sync with type column CHECK di migration jika perlu */
export const NOTIFICATION_TYPES = {
  PAYMENT_PROOF: "payment_proof",
  PRIVATE_TRIP_REQUEST: "private_trip_request",
  PARTICIPANT_ADDED: "participant_added",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
