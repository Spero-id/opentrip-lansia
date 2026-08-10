import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import { bookings, bookingParticipants, healthDeclarations } from "@/modules/booking/booking.schema";
import { tripDepartures, trips, tripPrices } from "@/db/schema/trips";
import { auth } from "@/modules/auth/auth.config";
import { and, eq } from "drizzle-orm";

const SERVICE_FEE = 15000;

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
      appliedVoucher,
      subtotal,
      totalAmount,
    } = body;

    console.log("Checkout request:", { orderId, destinationTitle: destination?.title, pax, totalAmount });

    if (!orderId || !destination || !pax || !totalAmount) {
      console.log("Missing fields:", { orderId: !!orderId, destination: !!destination, pax: !!pax, totalAmount: !!totalAmount });
      return NextResponse.json(
        { error: "Data pesanan tidak lengkap" },
        { status: 400 }
      );
    }

    // Get valid departureId - use destination's departureId if it's a UUID, otherwise get first available
    let departureId = destination.departureId || destination.departure_id || null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!departureId || !uuidRegex.test(String(departureId))) {
      // Try to get first departure from database using raw SQL
      try {
        const result = await db.execute(
          `SELECT id FROM trip_departures LIMIT 1`
        );
        if (result.rows && result.rows.length > 0) {
          departureId = result.rows[0].id;
        }
      } catch (e) {
        console.log("Failed to get departure:", e);
        // If table doesn't exist, use a dummy UUID
        departureId = "00000000-0000-0000-0000-000000000001";
      }
    }

    console.log("Using departureId:", departureId);

    if (!departureId) {
      return NextResponse.json(
        { error: "Departure tidak valid" },
        { status: 400 }
      );
    }

    const paxNum = Number(pax);
    const clientSubtotal = Number(subtotal);
    const clientTotal = Number(totalAmount);
    if (
      !Number.isInteger(paxNum) || paxNum < 1 || paxNum > 99 ||
      !Number.isFinite(clientSubtotal) || clientSubtotal <= 0 ||
      !Number.isFinite(clientTotal) || clientTotal <= 0
    ) {
      return NextResponse.json({ error: "Data harga tidak valid" }, { status: 400 });
    }

    const reportedUnit = Number(destination.priceMin);
    if (!Number.isFinite(reportedUnit) || reportedUnit <= 0) {
      return NextResponse.json({ error: "Harga destinasi tidak valid" }, { status: 400 });
    }
    if (clientSubtotal !== Math.round(reportedUnit * paxNum)) {
      return NextResponse.json(
        { error: "Harga pesanan tidak sesuai. Silakan muat ulang halaman." },
        { status: 400 }
      );
    }

    let discount = 0;
    if (appliedVoucher) {
      if (appliedVoucher.type === "percentage") {
        discount = Math.round(clientSubtotal * ((appliedVoucher.percentageValue ?? 0) / 100));
      } else {
        discount = appliedVoucher.discount || 0;
      }
    }
    if (discount > clientSubtotal) {
      return NextResponse.json({ error: "Diskon tidak valid" }, { status: 400 });
    }

    const expectedTotal = clientSubtotal + SERVICE_FEE - discount;
    if (clientTotal !== expectedTotal) {
      return NextResponse.json(
        { error: "Total pembayaran tidak sesuai. Silakan muat ulang halaman." },
        { status: 400 }
      );
    }

    try {
      const [dep] = await db
        .select({ tripId: tripDepartures.tripId })
        .from(tripDepartures)
        .where(eq(tripDepartures.id, departureId))
        .limit(1);
      const knownPrices: number[] = [];
      if (dep?.tripId) {
        const [trip] = await db
          .select({ priceMin: trips.priceMin })
          .from(trips)
          .where(eq(trips.id, dep.tripId))
          .limit(1);
        if (trip?.priceMin && trip.priceMin > 0) knownPrices.push(trip.priceMin);
      }
      const priceRows = await db
        .select({ price: tripPrices.price })
        .from(tripPrices)
        .where(and(eq(tripPrices.departureId, departureId), eq(tripPrices.isActive, true)));
      for (const row of priceRows) {
        const num = row.price ? Number(String(row.price).replace(/\D/g, "")) : null;
        if (num && num > 0) knownPrices.push(num);
      }
      if (knownPrices.length > 0 && !knownPrices.includes(Math.round(reportedUnit))) {
        console.warn(
          `Checkout price mismatch: departure ${departureId} known prices [${knownPrices.join(", ")}], reported ${reportedUnit}. Proceeding (static catalog).`
        );
      }
    } catch (e) {
      console.log("Failed to cross-check trip price:", e);
    }

    const total = String(clientTotal);
    const sub = String(clientSubtotal);

    // Save booking with pending_payment status
    const [booking] = await db.insert(bookings).values({
      bookingCode: orderId,
      userId,
      departureId,
      status: "pending_payment",
      totalParticipants: pax,
      subtotal: sub,
      discountAmount: String(discount),
      totalAmount: total,
      notes: JSON.stringify({
        destinationName: destination.title ?? destination.name,
        destinationId: destination.id,
        voucherCode: voucherCode || null,
        customerName: customer?.fullName,
        customerPhone: customer?.phone,
        customerAddress: customer?.address,
        emergencyContactName: customer?.emergencyContactName,
        emergencyContactPhone: customer?.emergencyContactPhone,
      }),
    }).returning();

    console.log("Booking created:", booking.id);

    // Save participant
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

    // Save health declaration
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

    return NextResponse.json({ success: true, booking });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    console.error("Checkout error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
