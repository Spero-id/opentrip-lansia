import { pgTable, uuid, varchar, text, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingCode: varchar("booking_code", { length: 50 }).notNull().unique(),
  userId: text("user_id").notNull(),
  departureId: uuid("departure_id").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  totalParticipants: integer("total_participants").notNull(),
  subtotal: varchar("subtotal", { length: 50 }).notNull(),
  discountAmount: varchar("discount_amount", { length: 50 }).default("0"),
  totalAmount: varchar("total_amount", { length: 50 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("IDR"),
  promoId: uuid("promo_id"),
  notes: text("notes"),
  bookingDate: timestamp("booking_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookingItems = pgTable("booking_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id),
  tripPriceId: uuid("trip_price_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: varchar("unit_price", { length: 50 }).notNull(),
  subtotal: varchar("subtotal", { length: 50 }).notNull(),
});

export const bookingParticipants = pgTable("booking_participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id),
  bookingItemId: uuid("booking_item_id"),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender", { length: 1 }),
  address: text("address"),
  emergencyContactName: varchar("emergency_contact_name", { length: 255 }),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 50 }),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const healthDeclarations = pgTable("health_declarations", {
  id: uuid("id").primaryKey().defaultRandom(),
  participantId: uuid("participant_id").notNull().unique().references(() => bookingParticipants.id),
  hasHypertension: boolean("has_hypertension").default(false),
  hasDiabetes: boolean("has_diabetes").default(false),
  hasHeartDisease: boolean("has_heart_disease").default(false),
  hasAsthma: boolean("has_asthma").default(false),
  hasVertigo: boolean("has_vertigo").default(false),
  hasJointBoneDisease: boolean("has_joint_bone_disease").default(false),
  noConditions: boolean("no_conditions").default(false),
  medications: text("medications"),
  mobilityOption: varchar("mobility_option", { length: 50 }).default("independent"),
  isDeclaredTrue: boolean("is_declared_true").default(false),
  signedAt: timestamp("signed_at").defaultNow().notNull(),
});

export const termsAcceptances = pgTable("terms_acceptances", {
  participantId: uuid("participant_id").notNull(),
  termsVersion: varchar("terms_version", { length: 50 }),
  isAccepted: boolean("is_accepted").default(false),
  acceptedAt: timestamp("accepted_at").defaultNow().notNull(),
});
