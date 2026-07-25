import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/modules/auth/auth.config";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedAdmin = pathname.startsWith("/admin");
  const isProtectedAgent = pathname.startsWith("/agent");
  const isProtectedUser = pathname.startsWith("/profile") || pathname.startsWith("/booking");

  if (isProtectedAdmin || isProtectedAgent || isProtectedUser) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      const role = (session.user as { role?: string })?.role;

      if (isProtectedAdmin && role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }

      if (isProtectedAgent && role !== "agent" && role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/agent/:path*",
    "/profile/:path*",
    "/booking/:path*",
  ],
};
