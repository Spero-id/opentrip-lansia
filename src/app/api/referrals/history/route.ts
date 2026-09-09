import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/shared/auth";
import { db } from "@/shared/db";
import { referrals } from "@/modules/referral/referral.schema";
import { bookings } from "@/modules/booking/booking.schema";
import { trips } from "@/modules/trip/trip.schema";
import { users } from "@/modules/auth/auth.schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    // Get all referrals with user names and booking info
    const allReferrals = await db
      .select({
        id: referrals.id,
        referrerId: referrals.referrerId,
        referredUserId: referrals.referredUserId,
        bookingId: referrals.bookingId,
        status: referrals.status,
        createdAt: referrals.createdAt,
        // Referrer info
        referrerName: users.name,
        referrerEmail: users.email,
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.referrerId, users.id))
      .orderBy(desc(referrals.createdAt));

    // Enrich with referred user names and trip info
    const enriched = await Promise.all(
      allReferrals.map(async (ref) => {
        let referredUserName: string | null = null;
        let referredUserEmail: string | null = null;
        let tripTitle: string | null = null;
        let bookingCode: string | null = null;

        if (ref.referredUserId) {
          const [referredUser] = await db
            .select({ name: users.name, email: users.email })
            .from(users)
            .where(eq(users.id, ref.referredUserId))
            .limit(1);
          referredUserName = referredUser?.name ?? null;
          referredUserEmail = referredUser?.email ?? null;
        }

        if (ref.bookingId) {
          const [booking] = await db
            .select({ bookingCode: bookings.bookingCode, tripId: bookings.departureId })
            .from(bookings)
            .where(eq(bookings.id, ref.bookingId))
            .limit(1);
          bookingCode = booking?.bookingCode ?? null;

          if (booking?.tripId) {
            // Try to find trip via departures
            const { tripDepartures } = await import("@/modules/trip/trip.schema");
            const [departure] = await db
              .select({ tripId: tripDepartures.tripId })
              .from(tripDepartures)
              .where(eq(tripDepartures.id, booking.tripId))
              .limit(1);
            if (departure?.tripId) {
              const [trip] = await db
                .select({ title: trips.title })
                .from(trips)
                .where(eq(trips.id, departure.tripId))
                .limit(1);
              tripTitle = trip?.title ?? null;
            }
          }
        }

        return {
          id: ref.id,
          referrerName: ref.referrerName ?? "Unknown",
          referrerEmail: ref.referrerEmail ?? "-",
          referredUserName: referredUserName ?? "Belum booking",
          referredUserEmail: referredUserEmail ?? "-",
          bookingCode,
          tripTitle,
          status: ref.status,
          createdAt: ref.createdAt,
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
