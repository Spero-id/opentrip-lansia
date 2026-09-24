import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/modules/auth";
import { requireAdmin } from "@/shared/auth";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const data = await authService.getAllUsers();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
