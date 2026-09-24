-- Site settings table for configurable application settings
CREATE TABLE IF NOT EXISTS "site_settings" (
  "key" varchar(100) PRIMARY KEY,
  "value" text NOT NULL,
  "description" text,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Insert default referral bonus points
INSERT INTO "site_settings" ("key", "value", "description")
VALUES ('referral_bonus_points', '10000', 'Jumlah poin bonus yang diberikan ke referrer saat referral berhasil')
ON CONFLICT ("key") DO NOTHING;
