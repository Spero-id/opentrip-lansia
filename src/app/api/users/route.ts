import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/features/auth";
import { requireAdmin } from "@/shared/auth";
import { toPublicError } from "@/shared/errors/to-public-error";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const data = await authService.getAllUsers();
    return NextResponse.json(data);
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
