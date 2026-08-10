import { pgTable, uuid, varchar, text, integer, timestamp, numeric, index } from "drizzle-orm/pg-core";
import { users } from "../auth/auth.schema";
import { trips } from "../trip/trip.schema";

export const privateTripRequests = pgTable("private_trip_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  durationDays: integer("duration_days").notNull(),
  participantsCount: integer("participants_count").notNull(),
  destinationPreferences: text("destination_preferences"),
  specialRequirements: text("special_requirements"),
  budgetEstimate: numeric("budget_estimate", { precision: 14, scale: 2 }),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userCreatedAtIdx: index("idx_private_trip_user_created").on(table.userId, table.createdAt),
  statusSubmittedIdx: index("idx_private_trip_status_submitted").on(table.status, table.submittedAt),
}));

export const privateTripDestinationsRequested = pgTable("private_trip_destinations_requested", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: uuid("request_id").notNull().references(() => privateTripRequests.id),
  tripId: uuid("trip_id").references(() => trips.id),
  customDestination: varchar("custom_destination", { length: 255 }),
  dayOrder: integer("day_order").notNull(),
  notes: text("notes"),
});

export const privateTripProposals = pgTable("private_trip_proposals", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: uuid("request_id").notNull().references(() => privateTripRequests.id),
  adminId: text("admin_id").notNull().references(() => users.id),
  proposalContent: text("proposal_content"),
  estimatedPrice: numeric("estimated_price", { precision: 14, scale: 2 }),
  inclusions: text("inclusions"),
  exclusions: text("exclusions"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  requestCreatedAtIdx: index("idx_private_trip_proposal_request_created").on(table.requestId, table.createdAt),
}));
