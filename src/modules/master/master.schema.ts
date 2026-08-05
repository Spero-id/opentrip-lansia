import { pgTable, uuid, varchar, text, integer, boolean, timestamp, jsonb, doublePrecision } from "drizzle-orm/pg-core";

export const destinationCategories = pgTable("destination_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").default(true),
});

export const destinations = pgTable("destinations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  location: text("location"),
  geoPoint: text("geo_point"),
  categoryId: uuid("category_id").references(() => destinationCategories.id),
  difficultyLevel: varchar("difficulty_level", { length: 20 }),
  accessibilityInfo: text("accessibility_info"),
  isActive: boolean("is_active").default(true),
  visitEstimateMinutes: integer("visit_estimate_minutes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  image: text("image"),
  rating: doublePrecision("rating"),
  images: jsonb("images").$type<string[]>(),
  reviewCount: integer("review_count"),
  priceMin: integer("price_min"),
  priceMax: integer("price_max"),
  highlights: jsonb("highlights").$type<string[]>(),
  itinerary: jsonb("itinerary").$type<{ day: number; title: string; description: string }[]>(),
  meetingPoints: jsonb("meeting_points").$type<{ time: string; location: string; description: string }[]>(),
  facilities: jsonb("facilities").$type<string[]>(),
});

export const horecaTypes = pgTable("horeca_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").default(true),
});

export const horeca = pgTable("horeca", {
  id: uuid("id").primaryKey().defaultRandom(),
  typeId: uuid("type_id").notNull().references(() => horecaTypes.id),
  name: varchar("name", { length: 255 }).notNull(),
  starCategory: varchar("star_category", { length: 20 }),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  geoPoint: text("geo_point"),
  rating: integer("rating").default(0),
  facilities: jsonb("facilities"),
  priceRange: varchar("price_range", { length: 100 }),
  isAccessibleForElderly: boolean("is_accessible_for_elderly").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vendorTypes = pgTable("vendor_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").default(true),
});

export const vendors = pgTable("vendors", {
  id: uuid("id").primaryKey().defaultRandom(),
  typeId: uuid("type_id").notNull().references(() => vendorTypes.id),
  name: varchar("name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  serviceArea: text("service_area"),
  isVerified: boolean("is_verified").default(false),
  rating: integer("rating").default(0),
  pricePerDay: varchar("price_per_day", { length: 50 }),
  currency: varchar("currency", { length: 3 }).default("IDR"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const meetingPoints = pgTable("meeting_points", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  geoPoint: text("geo_point"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: varchar("filename", { length: 255 }),
  url: varchar("url", { length: 500 }).notNull(),
  type: varchar("type", { length: 10 }),
  width: integer("width"),
  height: integer("height"),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
