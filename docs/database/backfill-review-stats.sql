-- Sinkronkan trips.review_count & trips.rating dengan ulasan approved.
--
-- Kenapa perlu: sejak awal tidak ada kode yang menulis kedua kolom ini, jadi
-- selalu null/0 dan UI menampilkan "4.0 (0 ulasan)". Kode kini menghitung ulang
-- setiap kali status review berubah, TAPI data lama sudah terlanjur basi.
--
-- Jalankan SEKALI di database produksi setelah deploy, dan di database dev.
-- Aman dijalankan ulang (idempoten).
--
-- Pemakaian:  psql "$DATABASE_URL" -f docs/database/backfill-review-stats.sql
--        atau jalankan lewat Neon SQL Editor.

-- 1) Trip yang punya minimal satu ulasan approved
UPDATE trips t
SET review_count = sub.cnt,
    rating       = sub.avg
FROM (
  SELECT trip_id,
         count(*)::int                       AS cnt,
         ROUND(AVG(rating)::numeric, 1)::float AS avg
  FROM reviews
  WHERE status = 'approved'
  GROUP BY trip_id
) sub
WHERE t.id = sub.trip_id;

-- 2) Trip tanpa ulasan approved → jumlah 0, rating NULL (bukan 5.0)
UPDATE trips t
SET review_count = 0,
    rating       = NULL
WHERE NOT EXISTS (
  SELECT 1 FROM reviews r
  WHERE r.trip_id = t.id AND r.status = 'approved'
);

-- Verifikasi:
-- SELECT title, rating, review_count FROM trips;
