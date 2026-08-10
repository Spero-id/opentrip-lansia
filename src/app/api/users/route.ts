import { NextResponse } from "next/server";
import { authService } from "@/modules/auth";

export async function GET() {
  try {
    const data = await authService.getAllUsers();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
