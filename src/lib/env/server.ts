import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import { clientRuntimeEnv, clientSchema } from "./client";

const POSTGRES_URL_RE = /^postgres(ql)?:\/\//;

const server = createEnv({
  server: {
    DATABASE_URL: z
      .url()
      .refine((v) => POSTGRES_URL_RE.test(v), {
        message: "harus diawali postgres:// atau postgresql://",
      }),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
    GOOGLE_CLIENT_ID: z.string().default(""),
    GOOGLE_CLIENT_SECRET: z.string().default(""),
    ADMIN_EMAIL: z.string().default(""),
    RESEND_API_KEY: z.string().min(1),
    RESEND_EMAIL_FROM: z.string().default("onboarding@resend.dev"),
    BASE_URL: z.url().default("http://localhost:3000"),
  },
  client: clientSchema,
  runtimeEnv: {
    ...clientRuntimeEnv,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_EMAIL_FROM: process.env.RESEND_EMAIL_FROM,
    BASE_URL: process.env.BASE_URL,
  },
  emptyStringAsUndefined: true,
});

export const DATABASE_URL = server.DATABASE_URL;
export const BETTER_AUTH_SECRET = server.BETTER_AUTH_SECRET;
export const BETTER_AUTH_URL = server.BETTER_AUTH_URL;
export const GOOGLE_CLIENT_ID = server.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = server.GOOGLE_CLIENT_SECRET;
export const ADMIN_EMAIL = server.ADMIN_EMAIL;
export const RESEND_API_KEY = server.RESEND_API_KEY;
export const RESEND_EMAIL_FROM = server.RESEND_EMAIL_FROM;
export const BASE_URL = server.BASE_URL;
