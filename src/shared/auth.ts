import { auth } from "@/modules/auth/auth.config";
import { NextRequest, NextResponse } from "next/server";

export async function requireAdmin(req: NextRequest | Request): Promise<NextResponse | null> {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}