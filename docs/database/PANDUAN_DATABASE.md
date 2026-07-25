# Panduan Implementasi Database — Trip Booking Platform (ERD v2)

> Dokumen ini adalah referensi wajib saat mengimplementasikan skema database.
> Target pembaca: junior developer atau AI assistant yang mengerjakan migrasi/query.
> Database target: **PostgreSQL 15+**.
> Ikuti aturan di sini apa adanya. Jika ragu, tanya senior — jangan improvisasi di area yang ditandai KRITIS.

---

## 1. Ringkasan Perubahan dari ERD v1 ke v2

| # | Perubahan | Alasan |
|---|-----------|--------|
| 1 | `trips` dipecah jadi `trips` (produk) + `trip_departures` (keberangkatan) | Satu paket bisa berangkat berkali-kali. Tanpa ini, tiap keberangkatan harus duplikasi seluruh paket dan review terpecah-pecah. |
| 2 | Tabel baru `booking_items` | Satu booking bisa campur tarif (2 dewasa + 1 anak). Sebelumnya 1 booking hanya bisa 1 tarif. |
| 3 | `itinerary_items` pakai 2 FK nullable (`destination_id`, `horeca_id`) + CHECK | Polymorphic (`location_id` + `location_type`) tidak bisa di-FK sehingga rawan data yatim. |
| 4 | Semua junction table diberi composite PK | Mencegah baris duplikat. |
| 5 | `health_declarations.participant_id` jadi UNIQUE | Deklarasi kesehatan itu 1:1 per peserta. |
| 6 | Tabel baru: `refunds`, `payment_webhook_events` | Refund harus tercatat untuk rekonsiliasi keuangan; webhook gateway bisa dobel dan perlu bisa di-replay. |
| 7 | Tabel baru: `commission_rules`; kolom `commission_amount` dihapus dari `referrals` | Satu sumber kebenaran untuk nominal komisi (di `commissions`), rate tidak hardcoded. |
| 8 | Tabel baru: `auth_tokens`; `user_sessions.token` → `token_hash` | Reset password & verifikasi email butuh tabel; token tidak boleh disimpan mentah. |
| 9 | Enum bisnis diganti lookup table: `destination_categories`, `horeca_types`, `vendor_types` | Enum PostgreSQL sulit dihapus/rename. Kategori bisnis pasti bertambah. |
| 10 | `reviews.media_urls` (jsonb) diganti junction `review_media` | Konsisten dengan pola tabel `media` yang sudah ada. |
| 11 | Semua PK uuid memakai **UUIDv7**; kolom uang **NUMERIC(14,2)** + kolom `currency` | Performa insert & presisi finansial. |
| 12 | Lat/lng decimal diganti `geography(Point, 4326)` (PostGIS) | Query "terdekat" yang benar dan cepat. |
| 13 | Kolom `search_vector` (tsvector, generated) di `trips`, `destinations`, `blogs` | Full-text search murah, bukan `ILIKE '%...%'`. |
| 14 | `trips.source_request_id` | Jejak konversi private trip request → trip. |
| 15 | Tabel `promotion_usages` + `usage_limit_per_user` | Melacak siapa pakai promo apa, batasi per user. |

---

## 2. Aturan WAJIB (KRITIS — jangan dilanggar)

### 2.1 Kuota & promo: selalu update atomik (race condition)

**Masalah:** dua user booking bersamaan di kursi terakhir → keduanya sukses → overbooking.

**JANGAN** lakukan pola ini (baca dulu, cek di aplikasi, lalu update):

```sql
-- ❌ SALAH - ada celah waktu antara SELECT dan UPDATE
SELECT quota, quota_booked FROM trip_prices WHERE id = :id;
-- (aplikasi mengecek quota_booked + n <= quota)
UPDATE trip_prices SET quota_booked = quota_booked + :n WHERE id = :id;
```

**LAKUKAN** update atomik dengan kondisi di WHERE, lalu cek affected rows:

```sql
-- ✅ BENAR
UPDATE trip_prices
SET quota_booked = quota_booked + :n
WHERE id = :id
  AND quota_booked + :n <= quota
  AND is_active = true;
-- Jika affected rows = 0 → kuota habis → gagalkan booking, JANGAN lanjut.
```

Pola yang sama berlaku untuk `promotions.usage_count`:

```sql
UPDATE promotions
SET usage_count = usage_count + 1
WHERE id = :id
  AND usage_count < usage_limit
  AND is_active = true
  AND now()::date BETWEEN valid_from AND valid_until;
```

Semua ini harus berada **di dalam satu transaksi** bersama INSERT booking. Jika booking gagal/dibatalkan/expired, kembalikan kuota di transaksi pembatalannya.

### 2.2 Uang: tipe & snapshot

- Semua kolom uang: `NUMERIC(14,2)`. **JANGAN PERNAH** pakai `FLOAT`/`DOUBLE` untuk uang.
- `booking_items.unit_price` adalah **snapshot** harga saat booking. Untuk menampilkan nominal booking lama, baca dari `booking_items`, **jangan** join ke `trip_prices` (harga bisa sudah berubah).
- Hal yang sama: `commissions.amount` adalah snapshot hasil perhitungan dari `commission_rules` saat itu.

### 2.3 Data kesehatan & pribadi (UU PDP)

`health_declarations` dan `profiles.medical_notes` adalah **data pribadi spesifik**.

- Kolom medis harus dienkripsi at-rest (minimal column-level, misal `pgcrypto` atau enkripsi di application layer).
- Akses baca dibatasi ke role tertentu — **bukan** semua admin.
- **JANGAN** menulis field medis plaintext ke `audit_logs.old_values` / `new_values`. Redaksi dulu (ganti dengan `"[REDACTED]"`) sebelum insert audit log.
- Terapkan kebijakan retensi: data kesehatan dihapus/dianonimkan setelah periode tertentu pasca trip selesai.

### 2.4 Token & sesi

- `user_sessions.token_hash` dan `auth_tokens.token_hash`: simpan **hash** (SHA-256) dari token, bukan token mentahnya. Token mentah hanya ada di sisi client.
- `auth_tokens`: token sekali pakai — set `used_at` saat dipakai, tolak jika `used_at IS NOT NULL` atau `expires_at < now()`.
- Job harian: hapus `user_sessions` yang `expires_at < now()`.

### 2.5 Webhook pembayaran

Gateway (Midtrans/Xendit/DOKU) bisa mengirim notifikasi **lebih dari sekali** untuk transaksi yang sama.

1. Setiap webhook masuk → INSERT dulu ke `payment_webhook_events` (payload mentah, status `received`).
2. Proses idempotent: cek `payments.idempotency_key` — jika sudah pernah diproses, tandai event `ignored` dan berhenti.
3. Jangan pernah update status payment dua kali menjadi `success` (jangan double-credit poin/komisi).

---

## 3. Konvensi Skema

### 3.1 Primary key: UUIDv7

Semua PK bertipe `uuid`, tapi nilainya **UUIDv7** (time-ordered), bukan v4 (random). Alasan: v4 acak membuat index B-tree terfragmentasi pada tabel insert-heavy (`bookings`, `payments`, `loyalty_transactions`, `audit_logs`).

- Generate di application layer (library uuidv7 tersedia di hampir semua bahasa), atau
- PostgreSQL 18+: `uuidv7()` bawaan; PostgreSQL 15–17: pakai extension/function custom.

### 3.2 CHECK constraint yang wajib dibuat

```sql
-- itinerary_items: maksimal satu lokasi terisi
ALTER TABLE itinerary_items ADD CONSTRAINT chk_itinerary_location
CHECK (num_nonnulls(destination_id, horeca_id) <= 1);

-- reviews: rating 1-5
ALTER TABLE reviews ADD CONSTRAINT chk_review_rating
CHECK (rating BETWEEN 1 AND 5);

-- private_trip_destinations_requested: destinasi terdaftar ATAU custom
ALTER TABLE private_trip_destinations_requested ADD CONSTRAINT chk_ptdr_dest
CHECK (num_nonnulls(destination_id, custom_destination) = 1);

-- trip_prices: kuota tidak boleh terlampaui (jaring pengaman terakhir)
ALTER TABLE trip_prices ADD CONSTRAINT chk_quota
CHECK (quota_booked >= 0 AND quota_booked <= quota);

-- trip_departures: tanggal valid
ALTER TABLE trip_departures ADD CONSTRAINT chk_departure_dates
CHECK (end_date >= start_date);
```

### 3.3 UNIQUE constraint penting

```sql
ALTER TABLE profiles            ADD CONSTRAINT uq_profiles_user        UNIQUE (user_id);
ALTER TABLE health_declarations ADD CONSTRAINT uq_health_participant   UNIQUE (participant_id);
ALTER TABLE reviews             ADD CONSTRAINT uq_review_booking       UNIQUE (booking_id);
ALTER TABLE promotion_usages    ADD CONSTRAINT uq_promo_booking        UNIQUE (booking_id);
```

### 3.4 Enum vs lookup table — aturan memilih

- **Enum boleh** untuk *state machine* yang stabil dan dikontrol kode: `bookings.status`, `payments.status`, `users.role`, `trips.type`.
- **Lookup table wajib** untuk *data bisnis* yang bisa bertambah oleh admin: kategori destinasi, tipe horeca, tipe vendor.
- Jangan pernah menghapus/rename nilai enum di produksi tanpa rencana migrasi — di PostgreSQL ini menyakitkan.

---

## 4. Index — daftar wajib

PostgreSQL **tidak** otomatis meng-index kolom FK. Buat manual:

```sql
-- Hot path booking
CREATE INDEX idx_bookings_user_status      ON bookings (user_id, status);
CREATE INDEX idx_bookings_departure_status ON bookings (departure_id, status);
CREATE INDEX idx_booking_items_booking     ON booking_items (booking_id);
CREATE INDEX idx_participants_booking      ON booking_participants (booking_id);

-- Payment: partial index untuk job expiry/reminder
CREATE INDEX idx_payments_booking ON payments (booking_id);
CREATE INDEX idx_payments_pending ON payments (created_at) WHERE status = 'pending';

-- Katalog & landing page
CREATE INDEX idx_departures_trip_date ON trip_departures (trip_id, start_date);
CREATE INDEX idx_departures_upcoming  ON trip_departures (start_date)
  WHERE status IN ('scheduled', 'confirmed');
CREATE INDEX idx_trips_featured ON trips (created_at) WHERE is_featured = true;
CREATE INDEX idx_trips_status   ON trips (status);

-- Review publik (hanya approved yang tampil)
CREATE INDEX idx_reviews_trip_approved ON reviews (trip_id) WHERE status = 'approved';

-- Loyalty & komisi
CREATE INDEX idx_loyalty_user_created ON loyalty_transactions (user_id, created_at DESC);
CREATE INDEX idx_commissions_agent    ON commissions (agent_id, status);

-- Sesi & token
CREATE INDEX idx_sessions_expires ON user_sessions (expires_at);

-- Geospasial (butuh extension postgis)
CREATE INDEX idx_destinations_geo ON destinations USING GIST (geo_point);
CREATE INDEX idx_horeca_geo       ON horeca       USING GIST (geo_point);

-- Full-text search
CREATE INDEX idx_trips_search        ON trips        USING GIN (search_vector);
CREATE INDEX idx_destinations_search ON destinations USING GIN (search_vector);
CREATE INDEX idx_blogs_search        ON blogs        USING GIN (search_vector);

-- JSONB (HANYA jika ternyata perlu filter by facilities)
-- CREATE INDEX idx_horeca_facilities ON horeca USING GIN (facilities);
```

Contoh kolom tsvector sebagai generated column:

```sql
ALTER TABLE trips ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('indonesian', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('indonesian', coalesce(description, '')), 'B')
) STORED;
```

Contoh query "destinasi terdekat" (PostGIS):

```sql
SELECT id, name,
       ST_Distance(geo_point, ST_MakePoint(:lng, :lat)::geography) AS meters
FROM destinations
WHERE is_active = true
ORDER BY geo_point <-> ST_MakePoint(:lng, :lat)::geography
LIMIT 10;
```

---

## 5. Kolom Cache (Denormalisasi) & Rekonsiliasinya

Kolom berikut adalah **cache** dari agregat, bukan sumber kebenaran:

| Kolom cache | Sumber kebenaran | Cara update |
|---|---|---|
| `users.loyalty_points` | `SUM(points)` dari `loyalty_transactions` | Update dalam transaksi yang sama saat insert transaksi poin |
| `horeca.rating` | `AVG(rating)` dari `reviews` approved terkait | Recompute saat review di-approve/reject |
| `vendors.rating` | penilaian vendor | idem |
| `promotions.usage_count` | `COUNT(*)` dari `promotion_usages` | Update atomik (lihat §2.1) |
| `trip_prices.quota_booked` | jumlah peserta booking aktif | Update atomik (lihat §2.1) |

**Wajib ada job rekonsiliasi** (cron harian/mingguan) yang me-recompute nilai cache dari sumber kebenaran dan memperbaiki drift. Log setiap perbedaan yang ditemukan — drift pada poin loyalitas adalah bug prioritas tinggi.

Contoh rekonsiliasi poin:

```sql
UPDATE users u
SET loyalty_points = COALESCE(t.total, 0)
FROM (
  SELECT user_id, SUM(points) AS total
  FROM loyalty_transactions
  GROUP BY user_id
) t
WHERE u.id = t.user_id
  AND u.loyalty_points IS DISTINCT FROM COALESCE(t.total, 0);
```

---

## 6. Alur Bisnis Penting (urutan operasi)

### 6.1 Alur booking (satu transaksi database)

1. Validasi departure masih `scheduled`/`confirmed` dan `start_date` di masa depan.
2. Untuk tiap tarif: UPDATE atomik `trip_prices.quota_booked` (§2.1). Gagal → rollback semua.
3. Jika ada promo: UPDATE atomik `promotions.usage_count` + INSERT `promotion_usages`.
4. INSERT `bookings` (status `pending`) → `booking_items` (dengan snapshot `unit_price`) → `booking_participants` → `terms_acceptances`.
5. INSERT `payments` (status `pending`, isi `expired_at`, misal +2 jam).
6. COMMIT. Kirim ke gateway di luar transaksi.

### 6.2 Pembayaran expired (job berkala)

1. Cari `payments` dengan `status='pending' AND expired_at < now()` (pakai partial index).
2. Set payment `expired`, booking `cancelled`.
3. **Kembalikan kuota**: kurangi `quota_booked` sebesar peserta booking itu, kembalikan `usage_count` promo, hapus/void `promotion_usages`.
4. Semua dalam satu transaksi per booking.

### 6.3 Pembayaran sukses (dari webhook)

1. Simpan event mentah (§2.5), cek idempotency.
2. Payment → `success` (isi `paid_at`), booking → `confirmed`.
3. Insert `loyalty_transactions` (earn) + update cache poin.
4. Jika ada referral: hitung komisi dari `commission_rules` yang aktif → INSERT `commissions` (simpan `rule_id` dan `amount` snapshot), update `referrals.status` → `converted`.

### 6.4 Refund

1. INSERT `refunds` status `requested`.
2. Admin approve → isi `approved_by`, `approved_at`.
3. Setelah dana dikirim → status `processed`, isi `refund_reference`, booking → `refunded`, kembalikan kuota.
4. Batalkan komisi terkait (`commissions.status` → `cancelled`) jika belum dibayar.

### 6.5 Private trip → trip

Proposal `accepted` → buat record `trips` bertipe `private_trip` dengan `source_request_id` diisi, lalu buat satu `trip_departures` sesuai tanggal yang disepakati. Booking berjalan lewat alur normal.

---

## 7. Jangka Panjang: Partisi & Retensi

Tabel yang tumbuh tanpa batas — rencanakan **sebelum** datanya besar:

| Tabel | Strategi | Retensi |
|---|---|---|
| `audit_logs` | Range partition per bulan by `created_at` | 2 tahun, lalu arsip/hapus |
| `loyalty_transactions` | Range partition per bulan (saat > ~10 juta baris) | Permanen (finansial) |
| `payment_webhook_events` | Range partition per bulan | 6–12 bulan |
| `user_sessions` | Tidak perlu partisi | Hapus harian yang expired |
| `contact_messages` | Tidak perlu partisi | Sesuai kebijakan |

Catatan: mengubah tabel biasa menjadi partitioned di PostgreSQL memerlukan pembuatan ulang tabel — jauh lebih murah dilakukan sejak awal untuk `audit_logs` dan `payment_webhook_events`.

---

## 8. Larangan Umum (rangkuman untuk reviewer PR)

1. ❌ FLOAT untuk uang → ✅ NUMERIC(14,2).
2. ❌ Cek kuota di aplikasi lalu update terpisah → ✅ UPDATE atomik dengan kondisi di WHERE.
3. ❌ Join ke `trip_prices` untuk nominal booking lama → ✅ baca snapshot di `booking_items`.
4. ❌ `ILIKE '%kata%'` untuk pencarian → ✅ full-text search via `search_vector`.
5. ❌ Filter jarak dengan rumus manual di lat/lng → ✅ PostGIS.
6. ❌ Token/sesi disimpan mentah → ✅ simpan hash.
7. ❌ Data medis plaintext (termasuk di audit log) → ✅ enkripsi + redaksi.
8. ❌ Tambah nilai enum untuk kategori bisnis baru → ✅ insert ke lookup table.
9. ❌ Junction table tanpa PK → ✅ composite PK.
10. ❌ Proses webhook tanpa cek idempotency → ✅ selalu cek `idempotency_key`.
11. ❌ SELECT tanpa index pada FK yang di-join di hot path → ✅ cek daftar index §4.
12. ❌ Menghitung komisi dengan rate hardcoded → ✅ baca dari `commission_rules`, simpan `rule_id`.

---

## 9. Checklist Prioritas Implementasi

Urutan pengerjaan yang disarankan:

- [ ] **P0** — Skema inti: users, auth, trips + trip_departures, trip_prices, bookings + booking_items (struktur ini paling mahal diubah belakangan).
- [ ] **P0** — UPDATE atomik kuota & promo di service booking.
- [ ] **P0** — Composite PK junction tables + semua CHECK/UNIQUE constraint (§3.2–3.3).
- [ ] **P1** — Index hot path (§4) + UUIDv7 di semua PK.
- [ ] **P1** — payments + payment_webhook_events + idempotency + job expiry.
- [ ] **P1** — refunds + alur pengembalian kuota.
- [ ] **P2** — Enkripsi kolom medis + redaksi audit log + pembatasan akses.
- [ ] **P2** — commission_rules + alur komisi/payout.
- [ ] **P2** — Job rekonsiliasi kolom cache (§5).
- [ ] **P3** — Partisi audit_logs & webhook_events, kebijakan retensi.
- [ ] **P3** — PostGIS untuk fitur "terdekat", full-text search untuk katalog & blog.
