import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/shared/auth";
import { auth } from "@/modules/auth/auth.config";
import { notificationRepository } from "@/modules/notification/notification.repository";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Support legacy ?since param by ignoring (now backed by real table)
    // Optional filter: ?unreadOnly=true or ?type=xxx
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
        // legacy compatibility (undefined for new types)
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
}
