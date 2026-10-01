import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/utils/password";
import { generateCode } from "@/utils/helpers";
import { users } from "@/db/schema/auth";
import { session, account, verification } from "@/db/schema/auth";
import {
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from "@/lib/env.server";

export const auth = betterAuth({
  secret: BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL,
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
      clientId: GOOGLE_CLIENT_ID || "",
      clientSecret: GOOGLE_CLIENT_SECRET || "",
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
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const referralCode = generateCode("OTL");
          return {
            data: {
              ...user,
              referralCode,
            },
          };
        },
      },
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
