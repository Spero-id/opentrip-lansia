import { createAuthClient } from "better-auth/react";
import { NEXT_PUBLIC_BETTER_AUTH_URL } from "@/lib/env";

export const authClient = createAuthClient({
  baseURL: NEXT_PUBLIC_BETTER_AUTH_URL,
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
