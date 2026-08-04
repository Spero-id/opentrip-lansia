import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { z } from "zod";

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminId: uuid("admin_id"),
  action: varchar("action", { length: 20 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: uuid("entity_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactMessageSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  email: z.string().email("Email tidak valid").max(255),
  phone: z.string().max(50).optional().nullable(),
  subject: z.string().max(255).optional().nullable(),
  message: z.string().min(1, "Pesan wajib diisi"),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
