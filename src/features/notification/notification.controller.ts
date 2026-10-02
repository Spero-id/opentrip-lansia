import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/features/auth/auth.config";
import { notificationRepository } from "./notification.repository";

type IdParams = { params: Promise<{ id: string }> };

async function sessionUserId(req: NextRequest): Promise<string | null> {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user?.id ?? null;
}

export const notificationController = {
  async list(req: NextRequest) {
    try {
      const userId = await sessionUserId(req);
      if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { searchParams } = new URL(req.url);
      const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
      const offset = parseInt(searchParams.get("offset") || "0");
      const unreadOnly = searchParams.get("unreadOnly") === "true";

      let notifications = await notificationRepository.findByUserId(userId, limit, offset);
      if (unreadOnly) notifications = notifications.filter((n) => !n.isRead);
      const unreadCount = await notificationRepository.countUnread(userId);

      return NextResponse.json({
        notifications: notifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          isRead: n.isRead,
          createdAt: n.createdAt,
          readAt: n.readAt,
          link: (n as unknown as { link?: string | null }).link ?? null,
          bookingCode: null,
          status: n.type,
          amount: null,
          participantCount: null,
          userName: null,
          userEmail: null,
        })),
        unreadCount,
        total: notifications.length,
      });
    } catch (err) {
      console.error("Error fetching notifications:", err);
      return NextResponse.json({ error: "Gagal mengambil notifikasi" }, { status: 500 });
    }
  },

  async markRead(req: NextRequest, ctx: IdParams) {
    const userId = await sessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await ctx.params;
    const updated = await notificationRepository.markAsRead(id, userId);
    if (!updated) return NextResponse.json({ error: "Notifikasi tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true, notification: updated });
  },

  async markAllRead(req: NextRequest) {
    const userId = await sessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await notificationRepository.markAllAsRead(userId);
    return NextResponse.json({ success: true });
  },
};
