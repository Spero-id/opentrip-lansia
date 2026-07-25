import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/modules/auth/auth.service";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  try {
    const result = await authService.signIn(email, password, req.headers);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
  }
}
