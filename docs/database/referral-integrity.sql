-- Perbaikan skema domain Poin Referral — jalankan SEKALI per database (dev &
-- produksi). Idempoten: aman dijalankan berulang.
--
-- Latar: `loyalty_transactions.reference_id` dibuat bertipe uuid, tapi nilainya
-- berisi better-auth user id (text, mis. "CuBzV03Q2vgHGKpaKePuNDHJWrjIZFTD")
-- untuk bonus referral. Insert selalu gagal dengan:
--   invalid input syntax for type uuid
-- Schema di kode sudah benar (text) — database yang perlu disesuaikan.
--
-- Pemakaian:  psql "$DATABASE_URL" -f docs/database/referral-integrity.sql

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'loyalty_transactions'
      AND column_name = 'reference_id'
      AND data_type = 'uuid'
  ) THEN
    ALTER TABLE loyalty_transactions
      ALTER COLUMN reference_id TYPE text USING reference_id::text;
  END IF;
END $$;

-- Verifikasi (harus 'text'):
--   SELECT data_type FROM information_schema.columns
--   WHERE table_name='loyalty_transactions' AND column_name='reference_id';
--
-- Catatan: tabel `site_settings` juga wajib ada untuk bonus referral.
-- Lihat drizzle/0003_site_settings.sql (sudah tercantum di docs/DEPLOY.md 4b).
