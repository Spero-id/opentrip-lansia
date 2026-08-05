import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import { bookings, bookingParticipants } from "@/modules/booking/booking.schema";
import { payments } from "@/modules/payment/payment.schema";

import { auth } from "@/modules/auth/auth.config";

const PLACEHOLDER_UUID = "00000000-0000-0000-0000-000000000000";

export async function POST(req: NextRequest) {
  try {
    let userId = PLACEHOLDER_UUID;
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (session?.user?.id) {
        userId = session.user.id;
      }
    } catch {
      // Guest checkout fallback
    }

    const body = await req.json();
    const {
      orderId,
      destination,
      pax,
      travelDate,
      customer,
      participants,
      voucherCode,
      appliedVoucher,
      paymentMethod,
      subtotal,
      totalAmount,
    } = body;

    if (!orderId || !destination || !pax || !totalAmount) {
      return NextResponse.json(
        { error: "Data pesanan tidak lengkap" },
        { status: 400 }
      );
    }

    const total = String(Math.round(totalAmount));
    const sub = subtotal ? String(Math.round(subtotal)) : total;

    // Hitung diskon dari voucher
    let discount = 0;
    if (appliedVoucher) {
      if (appliedVoucher.type === "percentage") {
        discount = Math.round(subtotal * ((appliedVoucher.percentageValue ?? 0) / 100));
      } else {
        discount = appliedVoucher.discount || 0;
      }
    }

    // Simpan booking
    const [booking] = await db.insert(bookings).values({
      bookingCode: orderId,
      userId,
      departureId: PLACEHOLDER_UUID,
      status: "confirmed",
      totalParticipants: pax,
      subtotal: sub,
      discountAmount: String(discount),
      totalAmount: total,
      notes: JSON.stringify({
        destinationName: destination.title ?? destination.name,
        destinationId: destination.id,
        travelDate,
        voucherCode: voucherCode || null,
        customerName: customer?.fullName,
        customerEmail: customer?.email,
        customerPhone: customer?.phone,
        specialRequest: customer?.specialRequest,
      }),
    }).returning();

    // Simpan peserta
    if (participants?.length > 0) {
      await db.insert(bookingParticipants).values(
        participants.map((p: Record<string, unknown>, idx: number) => ({
          bookingId: booking.id,
          fullName: (p.fullName as string) || "",
          phone: (p.phone as string) || "",
          dateOfBirth: (p.birthDate as string) || null,
          gender: (p.gender as string) || null,
          isPrimary: idx === 0,
        }))
      );
    }

    // Simpan pembayaran
    await db.insert(payments).values({
      bookingId: booking.id,
      method: paymentMethod || "manual",
      amount: total,
      status: "paid",
      paidAt: new Date(),
    });

    return NextResponse.json({ success: true, booking });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    console.error("Checkout error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
