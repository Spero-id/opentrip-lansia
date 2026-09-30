import { auth } from "@/modules/auth/auth.config";
import type { UserRole } from "@/shared/types";
import { NextRequest, NextResponse } from "next/server";

/** Role yang dikenal aplikasi (lihat users.role, default "user"). */
export type AppRole = UserRole;

/**
 * Ambil user dari session Better Auth, atau null kalau belum login /
 * cookie tidak valid.
 */
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

/**
 * Wajib login. Return null kalau lolos, atau NextResponse 401.
 * Pakai untuk endpoint yang datanya milik pengguna (booking, pembayaran,
 * voucher/promo, dsb).
 */
export async function requireSession(req: NextRequest | Request): Promise<NextResponse | null> {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

/**
 * Wajib login dengan role tertentu. Return null kalau lolos, atau
 * NextResponse 401 (belum login) / 403 (role tidak cocok).
 */
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
