import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/shared/auth";
import { db } from "@/shared/db";
import { referrals } from "@/db/schema/referral";
import { bookings } from "@/db/schema/bookings";
import { tripDepartures, trips } from "@/db/schema/trips";
import { users } from "@/db/schema/auth";
import { desc, eq, inArray } from "drizzle-orm";
import { toPublicError } from "@/shared/errors/to-public-error";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const allReferrals = await db
      .select({
        id: referrals.id,
        referrerId: referrals.referrerId,
        referredUserId: referrals.referredUserId,
        bookingId: referrals.bookingId,
        status: referrals.status,
        createdAt: referrals.createdAt,
        referrerName: users.name,
        referrerEmail: users.email,
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.referrerId, users.id))
      .orderBy(desc(referrals.createdAt));

    if (allReferrals.length === 0) return NextResponse.json([]);

    const referredIds = [
      ...new Set(allReferrals.map((r) => r.referredUserId).filter((v): v is string => !!v)),
    ];
    const bookingIds = [
      ...new Set(allReferrals.map((r) => r.bookingId).filter((v): v is string => !!v)),
    ];

    const [referredUsers, bookingRows] = await Promise.all([
      referredIds.length
        ? db
            .select({ id: users.id, name: users.name, email: users.email })
            .from(users)
            .where(inArray(users.id, referredIds))
        : Promise.resolve([]),
      bookingIds.length
        ? db
            .select({ id: bookings.id, bookingCode: bookings.bookingCode, departureId: bookings.departureId })
            .from(bookings)
            .where(inArray(bookings.id, bookingIds))
        : Promise.resolve([]),
    ]);

    const departureIds = [...new Set(bookingRows.map((b) => b.departureId).filter((v): v is string => !!v))];

    const departureRows = departureIds.length
      ? await db
          .select({ id: tripDepartures.id, tripId: tripDepartures.tripId })
          .from(tripDepartures)
          .where(inArray(tripDepartures.id, departureIds))
      : [];

    const tripIds = [...new Set(departureRows.map((d) => d.tripId).filter((v): v is string => !!v))];

    const tripRows = tripIds.length
      ? await db.select({ id: trips.id, title: trips.title }).from(trips).where(inArray(trips.id, tripIds))
      : [];

    const referredById = new Map(referredUsers.map((u) => [u.id, u]));
    const bookingById = new Map(bookingRows.map((b) => [b.id, b]));
    const tripIdByDeparture = new Map(departureRows.map((d) => [d.id, d.tripId]));
    const titleByTrip = new Map(tripRows.map((t) => [t.id, t.title]));

    const enriched = allReferrals.map((ref) => {
      const referredUser = ref.referredUserId ? referredById.get(ref.referredUserId) : undefined;
      const booking = ref.bookingId ? bookingById.get(ref.bookingId) : undefined;
      const tripId = booking?.departureId ? tripIdByDeparture.get(booking.departureId) : undefined;

      return {
        id: ref.id,
        referrerName: ref.referrerName ?? "Unknown",
        referrerEmail: ref.referrerEmail ?? "-",
        referredUserName: referredUser?.name ?? "Belum booking",
        referredUserEmail: referredUser?.email ?? "-",
        bookingCode: booking?.bookingCode ?? null,
        tripTitle: tripId ? (titleByTrip.get(tripId) ?? null) : null,
        status: ref.status,
        createdAt: ref.createdAt,
      };
    });

    return NextResponse.json(enriched);
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
