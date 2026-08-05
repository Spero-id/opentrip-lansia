"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function useAdminAuth() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    async function checkAdmin() {
      try {
        const { data: session } = await authClient.getSession();
        if (!session?.user) {
          if (!cancelled) router.push("/login?redirect=" + encodeURIComponent(pathname));
          return;
        }
        if (session.user.role !== "admin") {
          if (!cancelled) router.push("/forbidden");
        }
      } catch {
        if (!cancelled) router.push("/login?redirect=" + encodeURIComponent(pathname));
      }
    }

    checkAdmin();
    return () => { cancelled = true; };
  }, [router, pathname]);
}