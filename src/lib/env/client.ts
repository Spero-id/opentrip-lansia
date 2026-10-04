import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const clientSchema = {
  NEXT_PUBLIC_BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: z.string().default(""),
  NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION: z.enum(["true", "false"]).default("false"),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().default(""),
  NEXT_PUBLIC_WHATSAPP_MESSAGE: z
    .string()
    .default("Halo Abangkuh, saya ingin bertanya tentang trip di Jelajah Memoria"),
};

export const clientRuntimeEnv = {
  NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
  NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION,
  NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  NEXT_PUBLIC_WHATSAPP_MESSAGE: process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE,
};

const client = createEnv({
  client: clientSchema,
  runtimeEnv: clientRuntimeEnv,
  emptyStringAsUndefined: true,
});

export const NEXT_PUBLIC_BETTER_AUTH_URL = client.NEXT_PUBLIC_BETTER_AUTH_URL;
export const NEXT_PUBLIC_MIDTRANS_CLIENT_KEY =
  client.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
export const NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION =
  client.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
export const NEXT_PUBLIC_WHATSAPP_NUMBER = client.NEXT_PUBLIC_WHATSAPP_NUMBER;
export const NEXT_PUBLIC_WHATSAPP_MESSAGE = client.NEXT_PUBLIC_WHATSAPP_MESSAGE;