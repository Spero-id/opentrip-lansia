import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import { payments } from "@/modules/payment/payment.schema";
import { bookings } from "@/modules/booking/booking.schema";
import { eq } from "drizzle-orm";
import { auth } from "@/modules/auth/auth.config";

const ALLOWED_METHODS = new Set(["bri", "mandiri", "gopay", "ovo", "dana", "qris"]);

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, paymentMethod, proofUrl } = body;

    if (!bookingId || !paymentMethod || !proofUrl) {
      return NextResponse.json({ error: "Data pembayaran tidak lengkap" }, { status: 400 });
    }
    if (typeof proofUrl !== "string" || !proofUrl.startsWith("/payments/") || proofUrl.includes("..")) {
      return NextResponse.json({ error: "URL bukti transfer tidak valid" }, { status: 400 });
    }
    if (!ALLOWED_METHODS.has(paymentMethod)) {
      return NextResponse.json({ error: "Metode pembayaran tidak valid" }, { status: 400 });
    }

    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }
    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (booking.status !== "pending_payment" && booking.status !== "pending") {
      return NextResponse.json({ error: "Pesanan sudah diproses sebelumnya" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(payments)
      .where(eq(payments.bookingId, bookingId));

    let payment;
    if (existing.length > 0 && existing[0].status === "pending") {
      [payment] = await db
        .update(payments)
        .set({ method: paymentMethod, proofUrl, amount: booking.totalAmount })
        .where(eq(payments.id, existing[0].id))
        .returning();
    } else {
      [payment] = await db
        .insert(payments)
        .values({
          bookingId,
          method: paymentMethod,
          amount: booking.totalAmount,
          currency: booking.currency || "IDR",
          status: "pending",
          proofUrl,
        })
        .returning();
    }

    await db
      .update(bookings)
      .set({ status: "pending", updatedAt: new Date() })
      .where(eq(bookings.id, bookingId));

    return NextResponse.json({ success: true, payment });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    console.error("Payment create error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
