import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin/* routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow login page to pass through (if exists under /admin/login)
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Edge-safe session check (cookie only). Role is enforced client-side
  // via useAdminAuth and server-side by every admin API route.
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", "/");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
