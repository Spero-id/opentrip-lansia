"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth/client";
import { buildAuthHref } from "@/utils/redirect";

/**
 * Log the user out and land on /login, carrying the current path in the
 * `redirect` param so signing back in returns the user to the page they
 * logged out from (same convention as the /my-trips guard and
 * `useAuthRedirect`). On signOut error the user stays on the page and can
 * retry; callers surface nothing beyond keeping their UI active.
 *
 * All 4 logout entry points (Navbar dropdown, AdminShell, MobileMenu,
 * profile LogoutButton) must use this hook so behavior stays consistent.
 */
export function useLogout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      const { error } = await signOut();
      if (error) return;

      router.replace(
        buildAuthHref("/login", window.location.pathname + window.location.search),
      );
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return { logout, loading };
}
