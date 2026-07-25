# Open Trip Lansia — Documentation Index

> Central index for AI-assisted development. Covers all files in `docs/` and the complete database schema (ERD v2, ~35 tables).

---

## File Index

| File | Description |
|------|-------------|
| `index.md` | **(this file)** — Central index of all docs + database schema |
| `PRD.md` | Product Requirements Document v1.0 — 14 epics, 50 issues, tech stack (Neon + Better Auth + Drizzle), phases, KPIs |
| `flow.md` | Mermaid flow diagrams for all 6 user flows (User, Private Trip, Agent, Admin, Review, System) |
| `database/PANDUAN_DATABASE.md` | Implementation guide for DB schema — constraints, atomic updates, encryption, indexes, business flows |
| `database/erd_revisi.mermaid` | Complete ERD v2 in Mermaid — all tables, columns, types, FK relationships |

---

## Database Schema Index (ERD v2 — ~35 tables)

### Domain: Users & Auth

| Table | File | Key Columns | Constraints & Notes |
|-------|------|-------------|---------------------|
| `users` | `erd_revisi.mermaid` | `id(uuid PK)`, `email(UK)`, `password_hash`, `full_name`, `phone`, `role(enum: admin\|agent\|user)`, `referral_code(UK)`, `referred_by(FK→users)`, `loyalty_points(CACHE)`, `is_verified` | PK=UUIDv7 |
| `profiles` | `erd_revisi.mermaid` | `id(uuid PK)`, `user_id(FK UNIQUE→users)`, `date_of_birth`, `gender(L\|P)`, `address`, `emergency_contact`, `medical_notes(ENCRYPTED)`, `preferences(jsonb)` | 1:1 with users; medical_notes encrypted at-rest |
| `auth_tokens` | `erd_revisi.mermaid` | `id(uuid PK)`, `user_id(FK)`, `token_hash(UK)`, `type(password_reset\|email_verification)`, `expires_at`, `used_at` | Store HASH not plaintext; one-time use via `used_at` |
| `user_sessions` | `erd_revisi.mermaid` | `id(uuid PK)`, `user_id(FK)`, `token_hash(UK)`, `expires_at(INDEX)`, `created_at` | Cleanup job removes expired daily |

### Domain: Master Data

| Table | File | Key Columns | Constraints & Notes |
|-------|------|-------------|---------------------|
| `destination_categories` | `erd_revisi.mermaid` | `id(uuid PK)`, `name`, `slug(UK)`, `is_active` | Lookup table (not enum) |
| `destinations` | `erd_revisi.mermaid` | `id(uuid PK)`, `name`, `slug(UK)`, `description`, `location`, `geo_point(geography)`, `category_id(FK)`, `difficulty_level(mudah\|sedang\|berat)`, `accessibility_info`, `is_active`, `visit_estimate_minutes`, `search_vector(tsvector GENERATED)`, `created_at` | GiST index on `geo_point`; GIN index on `search_vector` |
| `horeca_types` | `erd_revisi.mermaid` | `id(uuid PK)`, `name`, `slug(UK)`, `is_active` | Lookup table (not enum) |
| `horeca` | `erd_revisi.mermaid` | `id(uuid PK)`, `type_id(FK)`, `name`, `star_category(bintang_1..5\|non_bintang)`, `address`, `phone`, `geo_point(geography)`, `rating(CACHE)`, `facilities(jsonb)`, `price_range`, `is_accessible_for_elderly`, `is_active`, `created_at` | GiST index on `geo_point`; optional GIN on `facilities` |
| `vendor_types` | `erd_revisi.mermaid` | `id(uuid PK)`, `name`, `slug(UK)`, `is_active` | Lookup table (not enum) |
| `vendors` | `erd_revisi.mermaid` | `id(uuid PK)`, `type_id(FK)`, `name`, `contact_person`, `phone`, `email`, `service_area`, `is_verified`, `rating(CACHE)`, `price_per_day(NUMERIC(14,2))`, `currency(IDR)`, `is_active`, `created_at` | — |
| `media` | `erd_revisi.mermaid` | `id(uuid PK)`, `filename`, `url`, `type(image\|video)`, `width`, `height`, `file_size`, `created_at` | Reusable across trips, galleries, reviews, blogs |

### Domain: Trip Catalog

| Table | File | Key Columns | Constraints & Notes |
|-------|------|-------------|---------------------|
| `trips` | `erd_revisi.mermaid` | `id(uuid PK)`, `type(open_trip\|private_trip)`, `title`, `slug(UK)`, `description`, `duration_days`, `status(draft\|published\|archived)`, `thumbnail_id(FK→media)`, `source_request_id(FK→private_trip_requests)`, `is_featured`, `search_vector(tsvector GENERATED)`, `created_at`, `updated_at` | Partial index `WHERE is_featured = true`; GIN on `search_vector` |
| `trip_departures` | `erd_revisi.mermaid` | `id(uuid PK)`, `trip_id(FK)`, `start_date(INDEX)`, `end_date`, `max_participants`, `min_participants`, `status(scheduled\|confirmed\|ongoing\|completed\|cancelled)`, `notes`, `created_at`, `updated_at` | `CHECK(end_date >= start_date)`; index on `(trip_id, start_date)`; partial index on `start_date WHERE status IN ('scheduled','confirmed')` |
| `trip_prices` | `erd_revisi.mermaid` | `id(uuid PK)`, `departure_id(FK)`, `name(Dewasa\|Anak\|Early Bird)`, `price(NUMERIC(14,2))`, `currency(IDR)`, `quota`, `quota_booked(UPDATE ATOMIK)`, `valid_from`, `valid_until`, `is_active` | `CHECK(quota_booked >= 0 AND quota_booked <= quota)` |
| `trip_destinations` | `erd_revisi.mermaid` | `trip_id(PK,FK)`, `destination_id(PK,FK)`, `day_order(PK)`, `duration_hours`, `notes` | Composite PK |
| `trip_horeca` | `erd_revisi.mermaid` | `trip_id(PK,FK)`, `horeca_id(PK,FK)`, `night_number(PK)`, `meal_type(PK: breakfast\|lunch\|dinner\|stay)` | Composite PK |
| `trip_vendors` | `erd_revisi.mermaid` | `trip_id(PK,FK)`, `vendor_id(PK,FK)`, `service_type(PK: transport\|guide\|catering\|medical\|photo)`, `cost(NUMERIC(14,2))` | Composite PK |
| `itinerary_items` | `erd_revisi.mermaid` | `id(uuid PK)`, `trip_id(FK)`, `day_number`, `start_time`, `end_time`, `title`, `description`, `destination_id(FK nullable)`, `horeca_id(FK nullable)` | `CHECK(num_nonnulls(destination_id, horeca_id) <= 1)` |
| `trip_media` | `erd_revisi.mermaid` | `trip_id(PK,FK)`, `media_id(PK,FK)`, `sort_order`, `is_cover` | Composite PK |
| `trip_galleries` | `erd_revisi.mermaid` | `id(uuid PK)`, `trip_id(FK)`, `departure_id(FK nullable)`, `title`, `description`, `is_private`, `created_at` | — |
| `gallery_media` | `erd_revisi.mermaid` | `id(uuid PK)`, `gallery_id(FK)`, `media_id(FK)`, `uploaded_by(FK)`, `sort_order`, `created_at` | — |

### Domain: Booking & Payment

| Table | File | Key Columns | Constraints & Notes |
|-------|------|-------------|---------------------|
| `bookings` | `erd_revisi.mermaid` | `id(uuid PK)`, `booking_code(UK)`, `user_id(FK INDEX)`, `departure_id(FK INDEX)`, `status(pending\|confirmed\|cancelled\|completed\|refunded)`, `total_participants`, `subtotal(NUMERIC(14,2))`, `discount_amount`, `total_amount`, `currency(IDR)`, `promo_id(FK nullable)`, `notes`, `booking_date`, `created_at`, `updated_at` | Indexes on `(user_id, status)` and `(departure_id, status)` |
| `booking_items` | `erd_revisi.mermaid` | `id(uuid PK)`, `booking_id(FK INDEX)`, `trip_price_id(FK)`, `quantity`, `unit_price(NUMERIC(14,2) SNAPSHOT)`, `subtotal` | Snapshot — do NOT join to `trip_prices` for historical amounts |
| `booking_participants` | `erd_revisi.mermaid` | `id(uuid PK)`, `booking_id(FK INDEX)`, `booking_item_id(FK nullable)`, `full_name`, `phone`, `date_of_birth`, `gender(L\|P)`, `address`, `is_primary`, `created_at` | — |
| `health_declarations` | `erd_revisi.mermaid` | `id(uuid PK)`, `participant_id(FK UNIQUE)`, `has_heart_disease`, `has_hypertension`, `has_diabetes`, `has_asthma`, `has_allergies`, `other_conditions`, `needs_wheelchair`, `needs_walking_stick`, `medications`, `is_declared_true`, `signed_at` | 1:1 with participant; encrypted at-rest |
| `terms_acceptances` | `erd_revisi.mermaid` | `id(uuid PK)`, `booking_id(FK)`, `participant_id(FK)`, `terms_version`, `is_accepted`, `accepted_at` | — |
| `payments` | `erd_revisi.mermaid` | `id(uuid PK)`, `booking_id(FK INDEX)`, `transaction_id(UK)`, `idempotency_key(UK)`, `method(transfer_manual\|midtrans\|xendit\|doku)`, `amount(NUMERIC(14,2))`, `currency(IDR)`, `status(pending\|success\|failed\|expired)`, `gateway_response(jsonb)`, `expired_at`, `paid_at`, `created_at` | Partial index `WHERE status='pending'` for expiry job |
| `payment_webhook_events` | `erd_revisi.mermaid` | `id(uuid PK)`, `payment_id(FK nullable)`, `gateway(midtrans\|xendit\|doku)`, `external_id`, `raw_payload(jsonb)`, `process_status(received\|processed\|failed\|ignored)`, `received_at`, `processed_at` | Store raw payload for replay |
| `refunds` | `erd_revisi.mermaid` | `id(uuid PK)`, `booking_id(FK)`, `payment_id(FK)`, `amount(NUMERIC(14,2))`, `currency(IDR)`, `reason`, `status(requested\|approved\|rejected\|processed)`, `requested_by(FK)`, `approved_by(FK nullable)`, `refund_reference`, `approved_at`, `processed_at`, `created_at` | — |

### Domain: Reviews

| Table | File | Key Columns | Constraints & Notes |
|-------|------|-------------|---------------------|
| `reviews` | `erd_revisi.mermaid` | `id(uuid PK)`, `booking_id(FK UNIQUE)`, `user_id(FK)`, `trip_id(FK INDEX)`, `departure_id(FK nullable)`, `rating(CHECK 1-5)`, `content`, `is_verified_purchase`, `is_featured`, `status(pending\|approved\|rejected)`, `created_at` | Partial index `WHERE status='approved'`; `UNIQUE(booking_id)` |
| `review_media` | `erd_revisi.mermaid` | `review_id(PK,FK)`, `media_id(PK,FK)`, `sort_order` | Composite PK; replaces jsonb `media_urls` |

### Domain: Referral, Commission & Loyalty

| Table | File | Key Columns | Constraints & Notes |
|-------|------|-------------|---------------------|
| `commission_rules` | `erd_revisi.mermaid` | `id(uuid PK)`, `agent_id(FK nullable)`, `trip_id(FK nullable)`, `type(percentage\|nominal)`, `value`, `valid_from`, `valid_until`, `is_active`, `created_at` | NULL agent_id = global default; NULL trip_id = all trips |
| `referrals` | `erd_revisi.mermaid` | `id(uuid PK)`, `referrer_id(FK)`, `referred_user_id(FK)`, `booking_id(FK nullable)`, `status(pending\|converted\|paid)`, `created_at` | — |
| `commissions` | `erd_revisi.mermaid` | `id(uuid PK)`, `agent_id(FK INDEX)`, `referral_id(FK nullable)`, `booking_id(FK)`, `rule_id(FK)`, `amount(NUMERIC(14,2) SNAPSHOT)`, `status(pending\|approved\|paid\|cancelled)`, `approved_at`, `paid_at`, `created_at` | Index on `(agent_id, status)` |
| `commission_payouts` | `erd_revisi.mermaid` | `id(uuid PK)`, `agent_id(FK)`, `amount_requested(NUMERIC(14,2))`, `status(pending\|approved\|paid\|rejected)`, `admin_notes`, `approved_by(FK)`, `paid_at`, `created_at` | — |
| `payout_commissions` | `erd_revisi.mermaid` | `payout_id(PK,FK)`, `commission_id(PK,FK)` | Composite PK (junction) |
| `loyalty_transactions` | `erd_revisi.mermaid` | `id(uuid PK)`, `user_id(FK INDEX)`, `points(positive=earn, negative=redeem/expire)`, `type(earn\|redeem\|expire\|adjustment)`, `reference_type`, `reference_id`, `description`, `expires_at`, `created_at` | Index on `(user_id, created_at DESC)` |

### Domain: Promotions

| Table | File | Key Columns | Constraints & Notes |
|-------|------|-------------|---------------------|
| `promotions` | `erd_revisi.mermaid` | `id(uuid PK)`, `code(UK)`, `title`, `type(percentage\|nominal)`, `value`, `min_purchase`, `max_discount`, `usage_limit`, `usage_count(UPDATE ATOMIK)`, `usage_limit_per_user`, `valid_from`, `valid_until`, `is_active`, `created_at` | Atomic update like quota |
| `promotion_usages` | `erd_revisi.mermaid` | `id(uuid PK)`, `promotion_id(FK)`, `user_id(FK)`, `booking_id(FK UNIQUE)`, `used_at` | `UNIQUE(booking_id)` — one promo per booking |

### Domain: Blog & SEO

| Table | File | Key Columns | Constraints & Notes |
|-------|------|-------------|---------------------|
| `blog_categories` | `erd_revisi.mermaid` | `id(uuid PK)`, `name`, `slug(UK)`, `description`, `created_at` | — |
| `blogs` | `erd_revisi.mermaid` | `id(uuid PK)`, `title`, `slug(UK)`, `content`, `excerpt`, `author_id(FK)`, `category_id(FK)`, `cover_image_id(FK→media)`, `tags(jsonb)`, `status(draft\|published\|archived)`, `search_vector(tsvector GENERATED)`, `published_at`, `created_at`, `updated_at` | GIN index on `search_vector` |

### Domain: Private Trip

| Table | File | Key Columns | Constraints & Notes |
|-------|------|-------------|---------------------|
| `private_trip_requests` | `erd_revisi.mermaid` | `id(uuid PK)`, `user_id(FK)`, `title`, `duration_days`, `participants_count`, `destination_preferences`, `special_requirements`, `budget_estimate(NUMERIC(14,2))`, `status(draft\|submitted\|reviewed\|approved\|rejected\|revision)`, `submitted_at`, `created_at`, `updated_at` | — |
| `private_trip_destinations_requested` | `erd_revisi.mermaid` | `id(uuid PK)`, `request_id(FK)`, `destination_id(FK nullable)`, `custom_destination(nullable)`, `day_order`, `notes` | `CHECK(num_nonnulls(destination_id, custom_destination) = 1)` |
| `private_trip_proposals` | `erd_revisi.mermaid` | `id(uuid PK)`, `request_id(FK)`, `admin_id(FK)`, `proposal_content`, `estimated_price(NUMERIC(14,2))`, `inclusions`, `exclusions`, `status(pending\|accepted\|rejected\|revised)`, `created_at` | — |

### Domain: Landing & Utility

| Table | File | Key Columns | Constraints & Notes |
|-------|------|-------------|---------------------|
| `contact_messages` | `erd_revisi.mermaid` | `id(uuid PK)`, `name`, `email`, `phone`, `subject`, `message`, `is_read`, `created_at` | — |
| `audit_logs` | `erd_revisi.mermaid` | `id(uuid PK)`, `admin_id(FK)`, `action(create\|update\|delete\|approve\|reject)`, `entity_type`, `entity_id`, `old_values(jsonb REDACTED)`, `new_values(jsonb REDACTED)`, `description`, `created_at` | Range-partition by month; retensi 2 tahun; redact sensitive fields |

---

## Critical Constraints & Rules (see `database/PANDUAN_DATABASE.md` for details)

| Rule | Summary |
|------|---------|
| **Atomic quota update** | `UPDATE trip_prices SET quota_booked = quota_booked + :n WHERE id = :id AND quota_booked + :n <= quota` — check affected rows |
| **Atomic promo update** | Same pattern as quota for `promotions.usage_count` |
| **Money type** | All money = `NUMERIC(14,2)` — NEVER float |
| **Price snapshot** | Read historical prices from `booking_items.unit_price`, NOT from `trip_prices` |
| **Health data encryption** | Column-level encryption for `health_declarations` and `profiles.medical_notes` |
| **Audit log redaction** | Redact medical/PII fields before writing to `audit_logs.old_values`/`new_values` |
| **Token storage** | Store `SHA-256 hash`, never plaintext tokens |
| **Webhook idempotency** | Check `payments.idempotency_key` before processing; never double-credit |
| **FK indexes** | All FK columns on hot path must have explicit indexes |
| **UUIDv7** | All PKs use UUIDv7 (time-ordered), not UUIDv4 |

---

## Indexes (from `database/PANDUAN_DATABASE.md` §4)

```sql
-- Hot path booking
idx_bookings_user_status      ON bookings (user_id, status)
idx_bookings_departure_status ON bookings (departure_id, status)
idx_booking_items_booking     ON booking_items (booking_id)
idx_participants_booking      ON booking_participants (booking_id)

-- Payment
idx_payments_booking  ON payments (booking_id)
idx_payments_pending  ON payments (created_at) WHERE status = 'pending'

-- Catalog & landing
idx_departures_trip_date ON trip_departures (trip_id, start_date)
idx_departures_upcoming  ON trip_departures (start_date) WHERE status IN ('scheduled','confirmed')
idx_trips_featured       ON trips (created_at) WHERE is_featured = true
idx_trips_status         ON trips (status)

-- Reviews
idx_reviews_trip_approved ON reviews (trip_id) WHERE status = 'approved'

-- Loyalty & commission
idx_loyalty_user_created ON loyalty_transactions (user_id, created_at DESC)
idx_commissions_agent    ON commissions (agent_id, status)

-- Sessions
idx_sessions_expires ON user_sessions (expires_at)

-- Geospatial (PostGIS)
idx_destinations_geo ON destinations USING GIST (geo_point)
idx_horeca_geo       ON horeca       USING GIST (geo_point)

-- Full-text search
idx_trips_search        ON trips        USING GIN (search_vector)
idx_destinations_search ON destinations USING GIN (search_vector)
idx_blogs_search        ON blogs        USING GIN (search_vector)
```

---

## Business Flows (see `database/PANDUAN_DATABASE.md` §6 and `flow.md`)

| Flow | Description | File |
|------|-------------|------|
| Booking | Validate departure → atomic quota update → promo → insert booking/payment → commit → send to gateway | `PANDUAN_DATABASE.md` §6.1 |
| Payment expiry | Find pending+expired → set expired/cancelled → restore quota/promo → one tx per booking | `PANDUAN_DATABASE.md` §6.2 |
| Payment success | Save webhook → check idempotency → update payment+booking → insert loyalty → calculate commission | `PANDUAN_DATABASE.md` §6.3 |
| Refund | Insert refund request → admin approve → process → update booking → cancel commission | `PANDUAN_DATABASE.md` §6.4 |
| Private → Trip | Proposal accepted → create `trips` with `source_request_id` → create `trip_departures` | `PANDUAN_DATABASE.md` §6.5 |
| User flow | Browse → search → trip detail → register → booking → payment → trip → review | `flow.md` §1 |
| Private trip flow | Select destination → custom duration → request → admin proposal → approve → booking | `flow.md` §2 |
| Agent flow | Register as agent → referral link → share → commission dashboard → payout | `flow.md` §3 |
| Admin flow | CRUD trips → itinerary → prices → HORECA → vendors → promo → reviews → commissions → blog | `flow.md` §4 |
| Review & gallery | Trip done → notification → upload photo → write review → moderation → public/private display | `flow.md` §5 |

---

## PRD Quick Reference (see `PRD.md`)

| Item | Detail |
|------|--------|
| Tech stack | Next.js + Neon PostgreSQL + Drizzle ORM + Better Auth + TanStack Table + Tailwind |
| Payment gateways | Midtrans, Xendit, DOKU |
| Database URL | `postgresql://neondb_owner:npg_GLYXbWEK3Uy1@ep-spring-feather-azrtnxj8-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |
| Search | PostgreSQL FTS (`tsvector`/`tsquery`), future RAG |
| MVP phases | 5 phases: Architecture → Trip CRUD → User Pages → Booking/Payment → Admin Dashboard |
| KPIs | Conversion ≥3%, Booking completion ≥80%, Lansia ≥60%, Active agents ≥50, Page load ≤2s |
| Cache columns | `users.loyalty_points`, `horeca.rating`, `vendors.rating`, `promotions.usage_count`, `trip_prices.quota_booked` — reconciliation job required |

---

## ERD Mermaid File

Full entity-relationship diagram: `database/erd_revisi.mermaid` (684 lines, all relationships mapped with Crow's foot notation).

---

*Last updated: 22 Jul 2026. Generated from files in `docs/`.*

## Connection Strings

| Resource | Connection |
|----------|-----------|
| **Neon DB** | `postgresql://neondb_owner:npg_GLYXbWEK3Uy1@ep-spring-feather-azrtnxj8-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |
| **Pooled (Neon)** | Same as above via `-pooler` hostname |*
