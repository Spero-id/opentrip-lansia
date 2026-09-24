import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/shared/auth";
import { auth } from "@/modules/auth/auth.config";
import { notificationRepository } from "@/modules/notification/notification.repository";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const session = await auth.api.getSession({ headers: req.headers });
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const updated = await notificationRepository.markAsRead(id, userId);
  if (!updated) return NextResponse.json({ error: "Notifikasi tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ success: true, notification: updated });
}
