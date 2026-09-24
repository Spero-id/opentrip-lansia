import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth.config";
import { db } from "@/shared/db";
import { referrals, commissions } from "@/modules/referral/referral.schema";
import { users } from "@/modules/auth/auth.schema";
import { bookings } from "@/modules/booking/booking.schema";
import { trips, tripDepartures } from "@/db/schema/trips";
import { eq, count, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") ?? "10")));
    const offset = (page - 1) * limit;

    const userId = session.user.id;

    // Get referrals with joined data
    const history = await db
      .select({
        id: referrals.id,
        referredUserId: referrals.referredUserId,
        bookingId: referrals.bookingId,
        status: referrals.status,
        createdAt: referrals.createdAt,
        // User info
        referredUserName: users.name,
        referredUserEmail: users.email,
        // Booking info
        bookingCode: bookings.bookingCode,
        // Trip info via departure
        tripId: tripDepartures.tripId,
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.referredUserId, users.id))
      .leftJoin(bookings, eq(referrals.bookingId, bookings.id))
      .leftJoin(tripDepartures, eq(bookings.departureId, tripDepartures.id))
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt))
      .limit(limit)
      .offset(offset);

    // Get trip titles for each unique tripId
    const tripIds = [...new Set(history.map((h) => h.tripId).filter(Boolean))] as string[];
    let tripMap = new Map<string, string>();
    if (tripIds.length > 0) {
      const allTrips = await db.select({ id: trips.id, title: trips.title }).from(trips);
      tripMap = new Map(allTrips.map((t) => [t.id, t.title]));
    }

    // Get commissions for each referral
    const referralIds = history.map((h) => h.id).filter(Boolean) as string[];
    const commissionMap = new Map<string, { amount: number; status: string }>();
    if (referralIds.length > 0) {
      const allCommissions = await db
        .select({
          referralId: commissions.referralId,
          amount: commissions.amount,
          status: commissions.status,
        })
        .from(commissions);
      for (const c of allCommissions) {
        if (c.referralId && referralIds.includes(c.referralId)) {
          commissionMap.set(c.referralId, {
            amount: Number(c.amount ?? 0),
            status: c.status ?? "pending",
          });
        }
      }
    }

    // Map data
    const mappedHistory = history.map((h) => ({
      id: h.id,
      referredUserName: h.referredUserName ?? "User",
      referredUserEmail: h.referredUserEmail ?? "",
      bookingCode: h.bookingCode ?? "-",
      tripName: h.tripId ? (tripMap.get(h.tripId) ?? "-") : "-",
      status: h.status ?? "pending",
      commissionAmount: commissionMap.get(h.id!)?.amount ?? 0,
      commissionStatus: commissionMap.get(h.id!)?.status ?? null,
      createdAt: h.createdAt,
    }));

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    return NextResponse.json({
      history: mappedHistory,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("GET /api/user/referral/history error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil history referral" },
      { status: 500 }
    );
  }
}
