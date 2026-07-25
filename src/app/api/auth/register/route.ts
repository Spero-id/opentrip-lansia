import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/modules/auth/auth.service";

export async function POST(req: NextRequest) {
  const { fullName, email, password } = await req.json();
  try {
    const result = await authService.signUp(email, password, fullName, req.headers);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Gagal mendaftar" }, { status: 400 });
  }
}
