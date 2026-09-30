import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveApiAccess } from "@/shared/auth/api-policy";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── API: penjagaan awal di edge (feat-080) ──────────────────────────
  // Kebijakan ada di src/shared/auth/api-policy.ts (satu sumber, dipakai
  // juga oleh test regresi src/__tests__/api-auth-audit.test.ts).
  // Di sini hanya cek keberadaan session cookie (murah, edge-safe, tanpa
  // DB). Validasi session asli + role admin TETAP di route handler
  // (requireSession / requireRole di src/shared/auth.ts).
  if (pathname.startsWith("/api")) {
    if (resolveApiAccess(request.method, pathname) === "public") {
      return NextResponse.next();
    }
    if (!getSessionCookie(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // ── Halaman admin ───────────────────────────────────────────────────
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow login page to pass through (if exists under /admin/login)
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Edge-safe session check (cookie only). Role is enforced server-side
  // in src/app/admin/layout.tsx (redirects non-admins to /forbidden).
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", "/admin");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
