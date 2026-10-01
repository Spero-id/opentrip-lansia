import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { auth } from "@/features/auth/auth.config";
import { notificationRepository } from "@/features/notification/notification.repository";

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const session = await auth.api.getSession({ headers: req.headers });
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await notificationRepository.markAllAsRead(userId);
  return NextResponse.json({ success: true });
}
