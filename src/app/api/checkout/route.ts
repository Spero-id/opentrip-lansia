import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import { bookings, bookingParticipants, healthDeclarations } from "@/modules/booking/booking.schema";
import { trips, tripDepartures } from "@/db/schema/trips";
import { promotionUsages } from "@/db/schema/promotions";
import { auth } from "@/modules/auth/auth.config";
import { promotionRepository } from "@/modules/promotion";
import { tripRepository } from "@/modules/trip/trip.repository";
import { and, eq, asc, count } from "drizzle-orm";

const SERVICE_FEE = 15000;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toNumber(value: unknown): number {
  return Number(String(value ?? "").replace(/\D/g, "")) || 0;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

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
      customer,
      voucherCode,
      subtotal: clientSubtotalRaw,
      totalAmount: clientTotalRaw,
    } = body;

    if (!orderId || !destination || !pax) {
      return NextResponse.json(
        { error: "Data pesanan tidak lengkap" },
        { status: 400 }
      );
    }

    // --- Resolve trip + departure from database (server-authoritative) ---
    const tripId = destination.id || destination.tripId;
    if (!tripId || !UUID_REGEX.test(String(tripId))) {
      return NextResponse.json(
        { error: "Destinasi tidak valid" },
        { status: 400 }
      );
    }

    const [trip] = await db
      .select()
      .from(trips)
      .where(and(eq(trips.id, tripId), eq(trips.status, "published")))
      .limit(1);
    if (!trip) {
      return NextResponse.json(
        { error: "Destinasi tidak tersedia" },
        { status: 400 }
      );
    }

    let departureId = destination.departureId || destination.departure_id || null;
    if (departureId && UUID_REGEX.test(String(departureId))) {
      const [dep] = await db
        .select()
        .from(tripDepartures)
        .where(and(eq(tripDepartures.id, departureId), eq(tripDepartures.tripId, trip.id)))
        .limit(1);
      if (!dep) departureId = null;
    } else {
      departureId = null;
    }
    if (!departureId) {
      const [dep] = await db
        .select()
        .from(tripDepartures)
        .where(eq(tripDepartures.tripId, trip.id))
        .orderBy(asc(tripDepartures.startDate))
        .limit(1);
      departureId = dep?.id ?? null;
    }
    if (!departureId) {
      return NextResponse.json(
        { error: "Jadwal keberangkatan tidak tersedia" },
        { status: 400 }
      );
    }

    const canonicalPrice = await tripRepository.findCanonicalPriceByDepartureId(departureId);
    const serverUnit = canonicalPrice ? toNumber(canonicalPrice.price) : 0;
    if (!canonicalPrice || serverUnit <= 0) {
      return NextResponse.json(
        { error: "Harga trip belum tersedia" },
        { status: 400 }
      );
    }

    const paxNum = Number(pax);
    if (!Number.isInteger(paxNum) || paxNum < 1 || paxNum > 99) {
      return NextResponse.json({ error: "Jumlah peserta tidak valid" }, { status: 400 });
    }

    const expectedSubtotal = serverUnit * paxNum;
    const clientSubtotal = Number(clientSubtotalRaw);
    if (!Number.isFinite(clientSubtotal) || Math.round(clientSubtotal) !== expectedSubtotal) {
      return NextResponse.json(
        { error: "Harga pesanan tidak sesuai. Silakan muat ulang halaman." },
        { status: 400 }
      );
    }

    // --- Voucher: validated server-side against promotions table ---
    const code = String(voucherCode ?? "").trim().toUpperCase();
    let discount = 0;
    let promoId: string | null = null;

    if (code) {
      const promo = await promotionRepository.findByCode(code);
      if (!promo || !promo.isActive) {
        return NextResponse.json({ error: "Kode voucher tidak valid." }, { status: 400 });
      }

      const today = todayISO();
      if (promo.validFrom && today < promo.validFrom) {
        return NextResponse.json({ error: "Voucher belum aktif." }, { status: 400 });
      }
      if (promo.validUntil && today > promo.validUntil) {
        return NextResponse.json({ error: "Voucher sudah kedaluwarsa." }, { status: 400 });
      }

      const minPurchase = toNumber(promo.minPurchase);
      if (minPurchase > 0 && expectedSubtotal < minPurchase) {
        return NextResponse.json(
          { error: "Pesanan belum memenuhi minimal pembelian untuk voucher ini." },
          { status: 400 }
        );
      }

      if (promo.usageLimit && (promo.usageCount ?? 0) >= promo.usageLimit) {
        return NextResponse.json(
          { error: "Voucher sudah mencapai batas pemakaian." },
          { status: 400 }
        );
      }

      if (promo.usageLimitPerUser && promo.usageLimitPerUser > 0) {
        const [usage] = await db
          .select({ total: count() })
          .from(promotionUsages)
          .where(and(eq(promotionUsages.promotionId, promo.id), eq(promotionUsages.userId, userId)));
        if ((usage?.total ?? 0) >= promo.usageLimitPerUser) {
          return NextResponse.json(
            { error: "Voucher sudah pernah digunakan." },
            { status: 400 }
          );
        }
      }

      const value = toNumber(promo.value);
      if (promo.type === "percentage") {
        discount = Math.round((expectedSubtotal * value) / 100);
        const maxDiscount = toNumber(promo.maxDiscount);
        if (maxDiscount > 0) discount = Math.min(discount, maxDiscount);
      } else {
        discount = value;
      }
      discount = Math.min(discount, expectedSubtotal);
      promoId = promo.id;
    }

    const expectedTotal = expectedSubtotal + SERVICE_FEE - discount;
    const clientTotal = Number(clientTotalRaw);
    if (!Number.isFinite(clientTotal) || Math.round(clientTotal) !== expectedTotal) {
      return NextResponse.json(
        { error: "Total pembayaran tidak sesuai. Silakan muat ulang halaman." },
        { status: 400 }
      );
    }

    // --- Persist booking with server-computed amounts ---
    const [booking] = await db.insert(bookings).values({
      bookingCode: orderId,
      userId,
      departureId,
      status: "pending_payment",
      totalParticipants: paxNum,
      subtotal: String(expectedSubtotal),
      discountAmount: String(discount),
      totalAmount: String(expectedTotal),
      promoId,
      notes: JSON.stringify({
        destinationName: destination.title ?? destination.name,
        destinationId: trip.id,
        departureId,
        voucherCode: code || null,
        promoId,
        customerName: customer?.fullName,
        customerPhone: customer?.phone,
        customerAddress: customer?.address,
        emergencyContactName: customer?.emergencyContactName,
        emergencyContactPhone: customer?.emergencyContactPhone,
      }),
    }).returning();

    const [participant] = await db.insert(bookingParticipants).values({
      bookingId: booking.id,
      fullName: customer?.fullName || "",
      phone: customer?.phone || "",
      dateOfBirth: customer?.birthDate || null,
      address: customer?.address || null,
      emergencyContactName: customer?.emergencyContactName || null,
      emergencyContactPhone: customer?.emergencyContactPhone || null,
      isPrimary: true,
    }).returning();

    if (participant && customer?.healthConditions) {
      const hc = customer.healthConditions;
      await db.insert(healthDeclarations).values({
        participantId: participant.id,
        hasHypertension: hc.hypertension || false,
        hasDiabetes: hc.diabetes || false,
        hasHeartDisease: hc.heart || false,
        hasAsthma: hc.asthma || false,
        hasVertigo: hc.vertigo || false,
        hasJointBoneDisease: hc.jointBone || false,
        noConditions: hc.none || false,
        medications: customer.medications || "Tidak ada",
        mobilityOption: customer.mobilityOption || "independent",
        isDeclaredTrue: true,
      });
    }

    if (promoId) {
      try {
        await promotionRepository.incrementUsage(promoId);
        await promotionRepository.recordUsage(promoId, userId, booking.id);
      } catch (e) {
        console.error("Failed to record promotion usage:", e);
      }
    }

    return NextResponse.json({ success: true, booking });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    console.error("Checkout error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
