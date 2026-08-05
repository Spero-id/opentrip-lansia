import { auth } from "@/modules/auth/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin/* routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow login page to pass through (if exists under /admin/login)
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", "/");
      return NextResponse.redirect(loginUrl);
    }

    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", "/");
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};