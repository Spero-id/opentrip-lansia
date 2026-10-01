function str(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

function bool(name: string): boolean {
  return process.env[name] === "true";
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const DATABASE_URL = required("DATABASE_URL");
export const BETTER_AUTH_SECRET = required("BETTER_AUTH_SECRET");
export const BETTER_AUTH_URL = str("BETTER_AUTH_URL", "http://localhost:3000");
export const GOOGLE_CLIENT_ID = str("GOOGLE_CLIENT_ID");
export const GOOGLE_CLIENT_SECRET = str("GOOGLE_CLIENT_SECRET");
export const NEXT_PUBLIC_BETTER_AUTH_URL = str("NEXT_PUBLIC_BETTER_AUTH_URL", "http://localhost:3000");
export const NEXT_PUBLIC_MIDTRANS_CLIENT_KEY = str("NEXT_PUBLIC_MIDTRANS_CLIENT_KEY");
export const NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION = bool("NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION");
export const NEXT_PUBLIC_WHATSAPP_NUMBER = str("NEXT_PUBLIC_WHATSAPP_NUMBER");
export const NEXT_PUBLIC_WHATSAPP_MESSAGE = str(
  "NEXT_PUBLIC_WHATSAPP_MESSAGE",
  "Halo Abangkuh, saya ingin bertanya tentang trip di Jelajah Memoria",
);
export const SMTP_HOST = str("SMTP_HOST");
export const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
export const SMTP_SECURE = bool("SMTP_SECURE");
export const SMTP_USER = str("SMTP_USER");
export const SMTP_PASS = str("SMTP_PASS");
export const SMTP_FROM = str("SMTP_FROM");
export const ADMIN_EMAIL = str("ADMIN_EMAIL");
export const BASE_URL = str("BASE_URL", "http://localhost:3000");
