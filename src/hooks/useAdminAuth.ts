"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function useAdminAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const verified = useRef(false);

  useEffect(() => {
    if (verified.current) return;

    let cancelled = false;

    async function checkAdmin() {
      try {
        const { data: session } = await authClient.getSession();

        if (cancelled) return;

        if (!session?.user) {
          router.push("/login?redirect=" + encodeURIComponent(pathname));
          return;
        }

        if (session.user.role !== "admin") {
          router.push("/forbidden");
          return;
        }

        verified.current = true;
      } catch {
        if (!cancelled) {
          router.push("/login?redirect=" + encodeURIComponent(pathname));
        }
      }
    }

    checkAdmin();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}