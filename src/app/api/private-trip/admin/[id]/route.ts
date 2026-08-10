import { privateTripController } from "@/modules/private-trip/private-trip.controller";
import { auth } from "@/modules/auth/auth.config";
import { NextRequest, NextResponse } from "next/server";

async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
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

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const params = await context.params;
  return privateTripController.getAdminDetail(req, { params });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const params = await context.params;
  return privateTripController.updateRequestStatus(req, { params });
}
