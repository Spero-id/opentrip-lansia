import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import { clientRuntimeEnv, clientSchema } from "./client";

const server = createEnv({
  server: {
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
    GOOGLE_CLIENT_ID: z.string().default(""),
    GOOGLE_CLIENT_SECRET: z.string().default(""),
    SMTP_HOST: z.string().default(""),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_SECURE: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
    SMTP_USER: z.string().default(""),
    SMTP_PASS: z.string().default(""),
    SMTP_FROM: z.string().default(""),
    ADMIN_EMAIL: z.string().default(""),
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
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    BASE_URL: process.env.BASE_URL,
  },
  emptyStringAsUndefined: false,
});

export const DATABASE_URL = server.DATABASE_URL;
export const BETTER_AUTH_SECRET = server.BETTER_AUTH_SECRET;
export const BETTER_AUTH_URL = server.BETTER_AUTH_URL;
export const GOOGLE_CLIENT_ID = server.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = server.GOOGLE_CLIENT_SECRET;
export const SMTP_HOST = server.SMTP_HOST;
export const SMTP_PORT = server.SMTP_PORT;
export const SMTP_SECURE = server.SMTP_SECURE;
export const SMTP_USER = server.SMTP_USER;
export const SMTP_PASS = server.SMTP_PASS;
export const SMTP_FROM = server.SMTP_FROM;
export const ADMIN_EMAIL = server.ADMIN_EMAIL;
export const BASE_URL = server.BASE_URL;