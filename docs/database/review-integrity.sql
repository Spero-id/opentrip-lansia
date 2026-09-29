-- Integritas domain ulasan — jalankan SEKALI per database (dev & produksi).
-- Idempoten: aman dijalankan berulang, termasuk di database baru hasil
-- `drizzle-kit push` yang constraint-nya sudah dibuat otomatis oleh schema.
--
-- Pemakaian:  psql "$DATABASE_URL" -f docs/database/review-integrity.sql
--        atau jalankan lewat Neon SQL Editor.

-- 1) Junction review_media: composite PK.
--    Aturan docs/database/PANDUAN_DATABASE.md: junction table wajib punya PK
--    supaya baris duplikat tidak mungkin masuk.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'review_media'::regclass AND conname = 'review_media_pkey'
  ) THEN
    ALTER TABLE review_media
      ADD CONSTRAINT review_media_pkey PRIMARY KEY (review_id, media_id);
  END IF;
END $$;

-- 2) FK review_media.review_id harus CASCADE.
--    Tanpa ini, menghapus review yang masih punya media akan gagal (FK error).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'review_media'::regclass
      AND conname = 'review_media_review_id_reviews_id_fk'
  ) THEN
    ALTER TABLE review_media DROP CONSTRAINT review_media_review_id_reviews_id_fk;
  END IF;
END $$;

ALTER TABLE review_media
  ADD CONSTRAINT review_media_review_id_reviews_id_fk
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE;

-- 3) is_verified_purchase: semua review dihasilkan dari booking completed milik
--    user sendiri (divalidasi server saat insert) → semua memang terverifikasi.
--    Sebelumnya kolom ini selalu false padahal UI menampilkan
--    "N ulasan terverifikasi".
UPDATE reviews SET is_verified_purchase = true WHERE is_verified_purchase = false;

-- Verifikasi:
--   SELECT conname FROM pg_constraint WHERE conrelid = 'review_media'::regclass;
--   SELECT count(*) FROM reviews WHERE is_verified_purchase = false;  -- harus 0
