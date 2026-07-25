import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/shared/db";
import { users } from "./auth.schema";
import { session, account, verification } from "./better-auth.schema";
import crypto from "crypto";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    password: {
      hash: async (password) => {
        return crypto.createHash("sha256").update(password).digest("hex");
      },
      verify: async ({ password, hash }) => {
        const hashed = crypto.createHash("sha256").update(password).digest("hex");
        return hashed === hash;
      },
    },
  },
  user: {
    modelName: "users",
    additionalFields: {
      phone: { type: "string", required: false },
      role: { type: "string", required: false },
      referralCode: { type: "string", required: false },
      referredBy: { type: "string", required: false },
      loyaltyPoints: { type: "number", required: false },
    },
  },
  session: {
    modelName: "session",
  },
  account: {
    modelName: "account",
  },
  verification: {
    modelName: "verification",
  },
});
