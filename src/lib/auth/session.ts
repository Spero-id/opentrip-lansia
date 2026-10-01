import { auth } from "@/features/auth/auth.config";
import type { UserRole } from "@/shared/types";
import { NextRequest, NextResponse } from "next/server";

export type AppRole = UserRole;

export async function getSessionUser(
  req: NextRequest | Request
): Promise<{ id: string; role?: string } | null> {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    return session?.user
      ? { id: session.user.id, role: session.user.role ?? undefined }
      : null;
  } catch {
    return null;
  }
}

export async function requireSession(req: NextRequest | Request): Promise<NextResponse | null> {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function requireRole(
  req: NextRequest | Request,
  roles: AppRole[]
): Promise<NextResponse | null> {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!roles.includes(session.user.role as AppRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function requireAdmin(req: NextRequest | Request): Promise<NextResponse | null> {
  return requireRole(req, ["admin"]);
}
