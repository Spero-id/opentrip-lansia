import { pgTable, uuid, varchar, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { bookings } from "../booking/booking.schema";

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id),
  transactionId: varchar("transaction_id", { length: 255 }).unique(),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),
  method: varchar("method", { length: 30 }),
  amount: varchar("amount", { length: 50 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("IDR"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  gatewayResponse: jsonb("gateway_response"),
  expiredAt: timestamp("expired_at"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paymentWebhookEvents = pgTable("payment_webhook_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  paymentId: uuid("payment_id").references(() => payments.id),
  gateway: varchar("gateway", { length: 30 }),
  externalId: varchar("external_id", { length: 255 }),
  rawPayload: jsonb("raw_payload"),
  processStatus: varchar("process_status", { length: 20 }).default("received"),
  receivedAt: timestamp("received_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

export const refunds = pgTable("refunds", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id),
  paymentId: uuid("payment_id").references(() => payments.id),
  amount: varchar("amount", { length: 50 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("IDR"),
  reason: text("reason"),
  status: varchar("status", { length: 20 }).default("requested"),
  requestedBy: uuid("requested_by").notNull(),
  approvedBy: uuid("approved_by"),
  refundReference: varchar("refund_reference", { length: 255 }),
  approvedAt: timestamp("approved_at"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
