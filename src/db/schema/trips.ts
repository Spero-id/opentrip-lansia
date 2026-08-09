import { pgTable, uuid, varchar, text, integer, boolean, timestamp, date, time, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { destinationCategories, meetingPoints } from "./master";

export const trips = pgTable("trips", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: varchar("type", { length: 20 }).notNull().default("open_trip"),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  durationDays: integer("duration_days").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  thumbnailId: uuid("thumbnail_id"),
  sourceRequestId: uuid("source_request_id"),
  maxParticipants: integer("max_participants"),
  meetingPointId: uuid("meeting_point_id").references(() => meetingPoints.id),
  isFeatured: boolean("is_featured").default(false),
  categoryId: uuid("category_id").references(() => destinationCategories.id),
  location: text("location"),
  province: text("province"),
  geoPoint: text("geo_point"),
  isSeniorFriendly: boolean("is_senior_friendly").default(false),
  accessibilityInfo: text("accessibility_info"),
  visitEstimateMinutes: integer("visit_estimate_minutes"),
  image: text("image"),
  rating: doublePrecision("rating"),
  images: jsonb("images").$type<string[]>(),
  reviewCount: integer("review_count"),
  priceMin: integer("price_min"),
  priceMax: integer("price_max"),
  highlights: jsonb("highlights").$type<string[]>(),
  facilities: jsonb("facilities").$type<(string | { name: string; icon?: string })[]>(),
  itinerary: jsonb("itinerary").$type<{ day: number; title: string; description: string }[]>(),
  meetingPointsJson: jsonb("meeting_points").$type<{ time: string; location: string; description: string }[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tripDepartures = pgTable("trip_departures", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("trip_id").notNull().references(() => trips.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  maxParticipants: integer("max_participants").notNull(),
  minParticipants: integer("min_participants").default(1),
  status: varchar("status", { length: 20 }).notNull().default("scheduled"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tripPrices = pgTable("trip_prices", {
  id: uuid("id").primaryKey().defaultRandom(),
  departureId: uuid("departure_id").notNull().references(() => tripDepartures.id),
  name: varchar("name", { length: 100 }).notNull(),
  price: varchar("price", { length: 50 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("IDR"),
  quota: integer("quota").notNull(),
  quotaBooked: integer("quota_booked").default(0),
  validFrom: date("valid_from"),
  validUntil: date("valid_until"),
  isActive: boolean("is_active").default(true),
});

export const tripHoreca = pgTable("trip_horeca", {
  tripId: uuid("trip_id").notNull().references(() => trips.id),
  horecaId: uuid("horeca_id").notNull(),
  nightNumber: integer("night_number").notNull(),
  mealType: varchar("meal_type", { length: 20 }).notNull(),
});

export const tripVendors = pgTable("trip_vendors", {
  tripId: uuid("trip_id").notNull().references(() => trips.id),
  vendorId: uuid("vendor_id").notNull(),
  serviceType: varchar("service_type", { length: 30 }).notNull(),
  cost: varchar("cost", { length: 50 }),
});

export const itineraryItems = pgTable("itinerary_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("trip_id").notNull().references(() => trips.id),
  dayNumber: integer("day_number").notNull(),
  startTime: time("start_time"),
  endTime: time("end_time"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  horecaId: uuid("horeca_id"),
});

export const tripMedia = pgTable("trip_media", {
  tripId: uuid("trip_id").notNull().references(() => trips.id),
  mediaId: uuid("media_id").notNull(),
  sortOrder: integer("sort_order").default(0),
  isCover: boolean("is_cover").default(false),
});

export const tripGalleries = pgTable("trip_galleries", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("trip_id").notNull().references(() => trips.id),
  departureId: uuid("departure_id"),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  isPrivate: boolean("is_private").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const galleryMedia = pgTable("gallery_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  galleryId: uuid("gallery_id").notNull().references(() => tripGalleries.id),
  mediaId: uuid("media_id").notNull(),
  uploadedBy: uuid("uploaded_by").notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
