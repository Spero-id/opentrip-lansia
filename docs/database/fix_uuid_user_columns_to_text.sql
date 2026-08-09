-- Fix UUID -> TEXT untuk kolom yang menyimpan users.id
-- Alasan: users.id bertipe text (better-auth memakai id nanoid 32 char utk user signup,
-- mis. "2QxjtOjK7w3GcojmKrFEa40t3JuCmzHt"). Kolom user-id yang masih uuid akan menolak
-- id nanoid tsb (invalid input syntax for type uuid).
--
-- Cara pakai: jalankan sekali di database yang dipakai aplikasi (aman diulang).
-- Kolom yang tidak ada di-skip otomatis. FK ke users(id) di-drop sementara lalu
-- di-re-add bila sebelumnya ada.

DO $$
DECLARE
  full_name TEXT;
  t TEXT;
  c TEXT;
  r RECORD;
  had_fk BOOLEAN;
BEGIN
  FOREACH full_name IN ARRAY ARRAY[
    'blogs.author_id',
    'payments.reviewed_by',
    'refunds.requested_by',
    'refunds.approved_by',
    'reviews.user_id',
    'promotion_usages.user_id',
    'loyalty_transactions.user_id',
    'audit_logs.admin_id',
    'commission_payouts.approved_by',
    'commission_payouts.agent_id',
    'commissions.agent_id',
    'commission_rules.agent_id',
    'referrals.referrer_id',
    'referrals.referred_user_id',
    'gallery_media.uploaded_by'
  ] LOOP
    t := split_part(full_name, '.', 1);
    c := split_part(full_name, '.', 2);

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t AND column_name = c
    ) THEN
      RAISE NOTICE 'SKIP %.% (kolom tidak ada)', t, c;
      CONTINUE;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t AND column_name = c AND data_type <> 'text'
    ) THEN
      -- drop FK yang menimpa kolom ini (kalau ada)
      had_fk := FALSE;
      FOR r IN
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = ANY(con.conkey)
        WHERE con.conrelid = (quote_ident(t))::regclass
          AND con.contype = 'f'
          AND a.attname = c
      LOOP
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', t, r.conname);
        had_fk := TRUE;
      END LOOP;

      EXECUTE format('ALTER TABLE %I ALTER COLUMN %I TYPE text', t, c);
      RAISE NOTICE 'ALTERED %.% -> text', t, c;

      IF had_fk THEN
        EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES public.users(id)', t, 'fk_' || t || '_' || c, c);
        RAISE NOTICE 'RE-ADDED FK %.% -> users.id', t, c;
      END IF;
    ELSE
      RAISE NOTICE 'OK %.% sudah text', t, c;
    END IF;
  END LOOP;
END $$;
