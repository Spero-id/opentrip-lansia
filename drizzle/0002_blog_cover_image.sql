-- Migration: Add cover_image column to blogs (blog cover image upload)
-- Run this SQL in your Neon SQL Editor or psql

ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "cover_image" text;