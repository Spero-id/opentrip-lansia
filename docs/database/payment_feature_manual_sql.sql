-- ============================================================
-- PAYMENT FEATURE: RESTORE MANUAL SQL (Session 17)
-- Jalankan bila DB tidak punya fitur payment (kolom reviewed_by
-- / payment_accounts tidak ada). Aman diulang.
-- ============================================================

-- 1) Tabel rekening tujuan
CREATE TABLE IF NOT EXISTS payment_accounts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  method          varchar(30)  NOT NULL UNIQUE,
  bank_name       varchar(100) NOT NULL,
  account_number  varchar(50)  NOT NULL,
  account_holder  varchar(255) NOT NULL,
  is_active       boolean      NOT NULL DEFAULT true,
  created_at      timestamp    NOT NULL DEFAULT now(),
  updated_at      timestamp    NOT NULL DEFAULT now()
);

-- 2) Seed 6 metode pembayaran (a.n. PT OpenTrip Lansia)
INSERT INTO payment_accounts (method, bank_name, account_number, account_holder, is_active) VALUES
  ('bri',     'BRI',          '1234-5678-9012-3456', 'PT OpenTrip Lansia', true),
  ('mandiri', 'Bank Mandiri', '1234567890',           'PT OpenTrip Lansia', true),
  ('gopay',   'GoPay',        '0812-3456-7890',       'PT OpenTrip Lansia', true),
  ('ovo',     'OVO',          '0812-3456-7890',       'PT OpenTrip Lansia', true),
  ('dana',    'DANA',         '0812-3456-7890',       'PT OpenTrip Lansia', true),
  ('qris',    'QRIS',         'QRIS-OTL-0001',        'PT OpenTrip Lansia', true)
ON CONFLICT (method) DO NOTHING;

-- 3) Kolom tambahan pada tabel payments (reviewed_by dibuat TEXT langsung,
--    sesuai schema fix terbaru — bukan uuid)
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS proof_url      text,
  ADD COLUMN IF NOT EXISTS bank_name      varchar(100),
  ADD COLUMN IF NOT EXISTS account_number varchar(50),
  ADD COLUMN IF NOT EXISTS account_holder varchar(255),
  ADD COLUMN IF NOT EXISTS admin_note     text,
  ADD COLUMN IF NOT EXISTS reviewed_at    timestamp,
  ADD COLUMN IF NOT EXISTS reviewed_by    text;

-- 4) (Opsional) FK reviewed_by -> users(id)
-- ALTER TABLE payments ADD CONSTRAINT payments_reviewed_by_users_id_fk
--   FOREIGN KEY (reviewed_by) REFERENCES public.users(id);
