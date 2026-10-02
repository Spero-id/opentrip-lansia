import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, bookingItems, bookingParticipants, healthDeclarations } from "@/db/schema/bookings";
import { trips, tripDepartures } from "@/db/schema/trips";
import { promotionUsages } from "@/db/schema/promotions";
import { referrals } from "@/db/schema/referral";
import { users } from "@/db/schema/auth";
import { auth } from "@/features/auth/auth.config";
import { promotionRepository } from "@/features/promotion";
import { computePromoDiscount } from "@/features/promotion";
import { tripRepository } from "@/features/trip/trip.repository";
import { and, eq, asc, count } from "drizzle-orm";
import { toPublicError } from "@/lib/errors/to-public-error";
import { withTransaction } from "@/lib/db/utils";
import { bookingService } from "./booking.service";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toNumber(value: unknown): number {
  return Number(String(value ?? "").replace(/\D/g, "")) || 0;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export const checkoutController = {
  async create(req: NextRequest) {
  try {
    let userId: string | null = null;
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (session?.user?.id) {
        userId = session.user.id;
      }
    } catch {
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
      referralCode,
      subtotal: clientSubtotalRaw,
      totalAmount: clientTotalRaw,
    } = body;

    if (!orderId || !destination || (!pax && !(body as { items?: unknown }).items)) {
      return NextResponse.json(
        { error: "Data pesanan tidak lengkap" },
        { status: 400 }
      );
    }

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
      if (dep) departureId = dep.id;
      else departureId = null;
    } else {
      departureId = null;
    }

    if (!departureId) {
      const [activeDep] = await db
        .select()
        .from(tripDepartures)
        .where(and(eq(tripDepartures.tripId, trip.id), eq(tripDepartures.isActive, true)))
        .limit(1);
      departureId = activeDep?.id ?? null;
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

    const validPrices = await tripRepository.findValidPricesByDepartureId(departureId);
    if (validPrices.length === 0) {
      return NextResponse.json(
        { error: "Harga trip belum tersedia" },
        { status: 400 }
      );
    }
    const priceById = new Map(validPrices.map((p) => [p.id, p]));

    type CheckoutItem = { priceId: string; qty: number; unit: number };
    let checkoutItems: CheckoutItem[];
    const rawItems = (body as { items?: unknown }).items;
    if (Array.isArray(rawItems) && rawItems.length > 0) {
      checkoutItems = [];
      for (const raw of rawItems) {
        const item = raw as { priceId?: unknown; qty?: unknown };
        const tier = typeof item.priceId === "string" ? priceById.get(item.priceId) : undefined;
        const qty = Number(item.qty);
        if (!tier || !Number.isInteger(qty) || qty < 1 || qty > 99) {
          return NextResponse.json(
            { error: "Tier harga tidak valid. Silakan muat ulang halaman." },
            { status: 400 }
          );
        }
        checkoutItems.push({ priceId: tier.id, qty, unit: Number(tier.price) });
      }
    } else {
      const canonical = validPrices.find((p) => p.name === "Dewasa") ?? validPrices[0];
      const paxNum = Number(pax);
      if (!Number.isInteger(paxNum) || paxNum < 1 || paxNum > 99) {
        return NextResponse.json({ error: "Jumlah peserta tidak valid" }, { status: 400 });
      }
      checkoutItems = [{ priceId: canonical.id, qty: paxNum, unit: Number(canonical.price) }];
    }

    const paxNum = checkoutItems.reduce((s, i) => s + i.qty, 0);
    if (paxNum < 1 || paxNum > 99) {
      return NextResponse.json({ error: "Jumlah peserta tidak valid" }, { status: 400 });
    }

    try {
      await bookingService.expireStalePendingBookings();
    } catch (e) {
      console.error("expireStalePending failed", e);
    }

    const taken: CheckoutItem[] = [];
    for (const item of checkoutItems) {
      const ok = await tripRepository.updateQuota(item.priceId, item.qty);
      if (!ok) {
        for (const prev of taken) {
          await tripRepository.releaseQuota(prev.priceId, prev.qty);
        }
        return NextResponse.json(
          { error: "Kuota tier habis. Silakan muat ulang halaman." },
          { status: 409 }
        );
      }
      taken.push(item);
    }

    const expectedSubtotal = checkoutItems.reduce((s, i) => s + i.unit * i.qty, 0);

    const birthDate = customer?.birthDate;
    if (birthDate) {
      const year = birthDate.split("-")[0];
      if (!year || year.length !== 4 || isNaN(Number(year))) {
        return NextResponse.json(
          { error: "Tanggal lahir tidak valid: tahun harus 4 digit" },
          { status: 400 }
        );
      }
      const birth = new Date(birthDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (birth > today) {
        return NextResponse.json(
          { error: "Tanggal lahir tidak boleh di masa depan" },
          { status: 400 }
        );
      }
    }

    const clientSubtotal = Number(clientSubtotalRaw);
    if (!Number.isFinite(clientSubtotal) || Math.round(clientSubtotal) !== expectedSubtotal) {
      return NextResponse.json(
        { error: "Harga pesanan tidak sesuai. Silakan muat ulang halaman." },
        { status: 400 }
      );
    }

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

      discount = computePromoDiscount(promo, expectedSubtotal);
      promoId = promo.id;
    }

    const expectedTotal = expectedSubtotal - discount;
    const clientTotal = Number(clientTotalRaw);
    if (!Number.isFinite(clientTotal) || Math.round(clientTotal) !== expectedTotal) {
      return NextResponse.json(
        { error: "Total pembayaran tidak sesuai. Silakan muat ulang halaman." },
        { status: 400 }
      );
    }

    const refCode = String(referralCode ?? "").trim().toUpperCase();
    let referrerId: string | null = null;

    if (refCode) {
      const [referrer] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.referralCode, refCode))
        .limit(1);

      if (!referrer) {
        return NextResponse.json(
          { error: "Kode referral tidak ditemukan. Periksa kembali kode Anda." },
          { status: 400 }
        );
      }
      if (referrer.id === userId) {
        return NextResponse.json(
          { error: "Tidak bisa menggunakan kode referral sendiri." },
          { status: 400 }
        );
      }
      referrerId = referrer.id;
    }

    const booking = await withTransaction(async (tx) => {
      const [created] = await tx.insert(bookings).values({
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

      const [participant] = await tx.insert(bookingParticipants).values({
        bookingId: created.id,
        fullName: customer?.fullName || "",
        phone: customer?.phone || "",
        dateOfBirth: customer?.birthDate || null,
        address: customer?.address || null,
        emergencyContactName: customer?.emergencyContactName || null,
        emergencyContactPhone: customer?.emergencyContactPhone || null,
        isPrimary: true,
      }).returning();

      await tx.insert(bookingItems).values(
        checkoutItems.map((item) => ({
          bookingId: created.id,
          tripPriceId: item.priceId,
          quantity: item.qty,
          unitPrice: String(item.unit),
          subtotal: String(item.unit * item.qty),
        }))
      );

      if (participant && customer?.healthConditions) {
        const hc = customer.healthConditions;
        await tx.insert(healthDeclarations).values({
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

      if (referrerId) {
        await tx.insert(referrals).values({
          referrerId,
          referredUserId: userId,
          bookingId: created.id,
          status: "pending",
        });
      }

      return created;
    });

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
    const message = toPublicError(err, "Terjadi kesalahan");
    console.error("Checkout error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
};
