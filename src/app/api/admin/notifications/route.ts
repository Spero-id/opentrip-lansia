import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import { bookings, bookingParticipants } from "@/modules/booking/booking.schema";
import { users } from "@/modules/auth/auth.schema";
import { desc, gte, eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/shared/auth";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const since = searchParams.get("since");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query - get recent bookings with user info
    const baseQuery = db
      .select({
        id: bookings.id,
        bookingCode: bookings.bookingCode,
        status: bookings.status,
        totalParticipants: bookings.totalParticipants,
        totalAmount: bookings.totalAmount,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .orderBy(desc(bookings.createdAt))
      .limit(limit);

    // If since is provided, filter for new notifications
    let recentBookings;
    if (since) {
      const sinceDate = new Date(since);
      recentBookings = await baseQuery.where(gte(bookings.createdAt, sinceDate));
    } else {
      recentBookings = await baseQuery;
    }

    // Get unread count (bookings since last check)
    const unreadSince = searchParams.get("unreadSince");
    let unreadCount = 0;

    if (unreadSince) {
      const unreadDate = new Date(unreadSince);
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(bookings)
        .where(gte(bookings.createdAt, unreadDate));
      unreadCount = countResult?.count || 0;
    }

    // Transform to notification format
    const notifications = recentBookings.map((booking) => {
      const notes = booking.notes ? JSON.parse(booking.notes) : {};
      return {
        id: booking.id,
        type: getNotificationType(booking.status),
        title: getNotificationTitle(booking.status),
        message: getNotificationMessage(booking.status, booking.bookingCode, booking.userName || "User"),
        bookingCode: booking.bookingCode,
        status: booking.status,
        amount: booking.totalAmount,
        participantCount: booking.totalParticipants,
        userName: booking.userName,
        userEmail: booking.userEmail,
        createdAt: booking.createdAt,
        isRead: false, // Will be managed client-side
      };
    });

    return NextResponse.json({
      notifications,
      unreadCount,
      total: recentBookings.length,
    });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return NextResponse.json(
      { error: "Gagal mengambil notifikasi" },
      { status: 500 }
    );
  }
}

function getNotificationType(status: string): string {
  switch (status) {
    case "pending_payment":
    case "pending":
      return "new_booking";
    case "awaiting_verification":
      return "payment_proof";
    case "confirmed":
      return "booking_confirmed";
    case "cancelled":
      return "booking_cancelled";
    default:
      return "update";
  }
}

function getNotificationTitle(status: string): string {
  switch (status) {
    case "pending_payment":
    case "pending":
      return "Pesanan Baru";
    case "awaiting_verification":
      return "Bukti Pembayaran Baru";
    case "confirmed":
      return "Pesanan Dikonfirmasi";
    case "cancelled":
      return "Pesanan Dibatalkan";
    default:
      return "Update Pesanan";
  }
}

function getNotificationMessage(status: string, bookingCode: string, userName: string): string {
  switch (status) {
    case "pending_payment":
    case "pending":
      return `${userName} telah membuat pesanan ${bookingCode} dan menunggu pembayaran.`;
    case "awaiting_verification":
      return `${userName} telah mengirim bukti pembayaran untuk ${bookingCode}.`;
    case "confirmed":
      return `Pesanan ${bookingCode} telah dikonfirmasi.`;
    case "cancelled":
      return `Pesanan ${bookingCode} telah dibatalkan.`;
    default:
      return `Ada update untuk pesanan ${bookingCode}.`;
  }
}
