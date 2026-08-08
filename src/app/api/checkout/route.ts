import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import { bookings, bookingParticipants } from "@/modules/booking/booking.schema";
import { payments, paymentAccounts } from "@/modules/payment/payment.schema";
import { eq } from "drizzle-orm";

import { auth } from "@/modules/auth/auth.config";

export async function POST(req: NextRequest) {
  try {
    let userId: string | null = null;
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (session?.user?.id) {
        userId = session.user.id;
      }
    } catch {
      // Guest checkout fallback
    }

    // Kalo bookings.userId NOT NULL + FK ke users, guest checkout gak bisa lanjut
    if (!userId) {
      return NextResponse.json(
        { error: "Anda harus login untuk melakukan checkout" },
        { status: 401 }
      );
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
      proofUrl,
      subtotal,
      totalAmount,
    } = body;

    if (!orderId || !destination || !pax || !totalAmount) {
      return NextResponse.json(
        { error: "Data pesanan tidak lengkap" },
        { status: 400 }
      );
    }
    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Pilih metode pembayaran terlebih dahulu" },
        { status: 400 }
      );
    }
    if (!proofUrl) {
      return NextResponse.json(
        { error: "Upload bukti transfer terlebih dahulu" },
        { status: 400 }
      );
    }
    if (!proofUrl.startsWith("/payments/") || proofUrl.includes("..")) {
      return NextResponse.json(
        { error: "URL bukti transfer tidak valid" },
        { status: 400 }
      );
    }

    const [account] = await db
      .select()
      .from(paymentAccounts)
      .where(eq(paymentAccounts.method, paymentMethod))
      .limit(1);

    if (!account) {
      return NextResponse.json(
        { error: "Metode pembayaran tidak tersedia" },
        { status: 400 }
      );
    }

    // Ganti ini sesuai field asli yang nyimpen departure id di object destination lo
    const departureId = destination.departureId ?? destination.id;
    if (!departureId) {
      return NextResponse.json(
        { error: "Departure tidak valid" },
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
      departureId,
      status: "pending",
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
      method: paymentMethod,
      amount: total,
      status: "pending",
      proofUrl,
      bankName: account?.bankName ?? null,
      accountNumber: account?.accountNumber ?? null,
      accountHolder: account?.accountHolder ?? null,
    });

    return NextResponse.json({ success: true, booking });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    console.error("Checkout error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}