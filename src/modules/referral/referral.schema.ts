import { pgTable, uuid, varchar, text, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";

export const commissionRules = pgTable("commission_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id"),
  tripId: uuid("trip_id"),
  type: varchar("type", { length: 20 }).notNull(),
  value: varchar("value", { length: 50 }).notNull(),
  validFrom: date("valid_from"),
  validUntil: date("valid_until"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const referrals = pgTable("referrals", {
  id: uuid("id").primaryKey().defaultRandom(),
  referrerId: uuid("referrer_id").notNull(),
  referredUserId: uuid("referred_user_id"),
  bookingId: uuid("booking_id"),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commissions = pgTable("commissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull(),
  referralId: uuid("referral_id"),
  bookingId: uuid("booking_id").notNull(),
  ruleId: uuid("rule_id"),
  amount: varchar("amount", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  approvedAt: timestamp("approved_at"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commissionPayouts = pgTable("commission_payouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull(),
  amountRequested: varchar("amount_requested", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  adminNotes: text("admin_notes"),
  approvedBy: uuid("approved_by"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payoutCommissions = pgTable("payout_commissions", {
  payoutId: uuid("payout_id").notNull().references(() => commissionPayouts.id),
  commissionId: uuid("commission_id").notNull().references(() => commissions.id),
});

export const loyaltyTransactions = pgTable("loyalty_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  points: integer("points").notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: uuid("reference_id"),
  description: text("description"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
