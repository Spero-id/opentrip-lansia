import { NextRequest, NextResponse } from "next/server";
import { reviewRepository } from "@/features/review";
import { bookings } from "@/db/schema/bookings";
import { reviews } from "@/db/schema/reviews";
import { tripDepartures } from "@/db/schema/trips";
import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { auth } from "@/features/auth/auth.config";
import { requireAdmin } from "@/lib/auth";
import { toPublicError } from "@/lib/errors/to-public-error";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const statusParam = searchParams.get("status");
    const tripIdParam = searchParams.get("tripId");

    if (statusParam === "approved" || tripIdParam) {
      const { reviewRepository } = await import("@/features/review");
      const data = tripIdParam
        ? await reviewRepository.findApprovedByTripId(tripIdParam)
        : await reviewRepository.findApproved();
      return NextResponse.json(data);
    }

    const denied = await requireAdmin(req);
    if (denied) return denied;
    const data = await reviewRepository.findAll();
    return NextResponse.json(data);
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const bookingId = body.bookingId;
    const tripId = body.tripId;
    const rating = Number(body.rating);
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!bookingId || !tripId) {
      return NextResponse.json({ error: "bookingId dan tripId wajib diisi" }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating harus angka 1-5" }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ error: "Isi ulasan wajib diisi" }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: "Ulasan maksimal 2000 karakter" }, { status: 400 });
    }

    const [booking] = await db
      .select({ departureId: bookings.departureId, status: bookings.status })
      .from(bookings)
      .where(and(eq(bookings.id, bookingId), eq(bookings.userId, session.user.id)))
      .limit(1);
    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan atau bukan milik Anda" }, { status: 403 });
    }

    if (booking.status !== "completed") {
      return NextResponse.json(
        { error: "Ulasan hanya bisa diberikan setelah trip selesai" },
        { status: 400 }
      );
    }

    const [departure] = await db
      .select({ tripId: tripDepartures.tripId })
      .from(tripDepartures)
      .where(eq(tripDepartures.id, booking.departureId))
      .limit(1);
    if (!departure || departure.tripId !== tripId) {
      return NextResponse.json({ error: "tripId tidak cocok dengan booking" }, { status: 400 });
    }

    const [existing] = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(eq(reviews.bookingId, bookingId))
      .limit(1);
    if (existing) {
      return NextResponse.json({ error: "Anda sudah mengulas booking ini" }, { status: 409 });
    }

    const data = await reviewRepository.create({
      bookingId,
      userId: session.user.id,
      tripId,
      departureId: booking.departureId,
      rating,
      content,
      isVerifiedPurchase: true,
      isFeatured: false,
      status: "pending",
    });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
