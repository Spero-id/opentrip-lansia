import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/shared/auth";
import { auth } from "@/modules/auth/auth.config";
import { notificationRepository } from "@/modules/notification/notification.repository";

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const session = await auth.api.getSession({ headers: req.headers });
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await notificationRepository.markAllAsRead(userId);
  return NextResponse.json({ success: true });
}
