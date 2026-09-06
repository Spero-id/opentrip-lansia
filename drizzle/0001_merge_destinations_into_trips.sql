-- Migration: Merge destinations into trips
-- Run this SQL in your Neon SQL Editor or psql

-- 1. Add destination fields to trips table
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "category_id" uuid REFERENCES "destination_categories"("id");
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "location" text;
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "geo_point" text;
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "is_senior_friendly" boolean DEFAULT false;
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "accessibility_info" text;
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "visit_estimate_minutes" integer;
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "image" text;
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "rating" double precision;
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "images" jsonb;
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "review_count" integer;
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "price_min" integer;
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "price_max" integer;
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "highlights" jsonb;
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "facilities" jsonb;
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "itinerary" jsonb;
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "meeting_points" jsonb;

-- 2. Remove destinationId from itinerary_items
ALTER TABLE "itinerary_items" DROP COLUMN IF EXISTS "destination_id";

-- 3. Drop trip_destinations table
DROP TABLE IF EXISTS "trip_destinations";

-- 4. Drop destinations table (data already in trips via seeder)
DROP TABLE IF EXISTS "destinations";
