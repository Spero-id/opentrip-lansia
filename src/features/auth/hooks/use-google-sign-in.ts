import { useState } from "react";
import { signIn } from "@/lib/auth/client";

export function useGoogleSignIn(
  redirectPath: string,
  setError: (message: string) => void
): { googleLoading: boolean; handleGoogleLogin: () => Promise<void> } {
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleLogin(): Promise<void> {
    setError("");
    setGoogleLoading(true);
    await signIn.social({
      provider: "google",
      callbackURL: redirectPath,
    });
    setGoogleLoading(false);
  }

  return { googleLoading, handleGoogleLogin };
}
