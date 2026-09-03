import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/shared/db";
import { hashPassword, verifyPassword } from "@/shared/utils/password";
import { users } from "./auth.schema";
import { session, account, verification } from "./better-auth.schema";

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
      hash: (password) => hashPassword(password),
      verify: ({ password, hash }) => verifyPassword(password, hash),
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
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
