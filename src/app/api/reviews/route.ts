import { NextRequest, NextResponse } from "next/server";
import { reviewRepository } from "@/modules/review";
import { bookings } from "@/modules/booking/booking.schema";
import { tripDepartures } from "@/modules/trip/trip.schema";
import { db } from "@/shared/db";
import { eq, and } from "drizzle-orm";
import { auth } from "@/modules/auth/auth.config";

export async function GET() {
  try {
    const data = await reviewRepository.findAll();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Wajib login — userId diambil dari session, bukan dari body
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

    // Booking harus milik user yang login
    const [booking] = await db
      .select({ departureId: bookings.departureId })
      .from(bookings)
      .where(and(eq(bookings.id, bookingId), eq(bookings.userId, session.user.id)))
      .limit(1);
    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan atau bukan milik Anda" }, { status: 403 });
    }

    // tripId harus cocok dengan trip dari departure booking tersebut
    const [departure] = await db
      .select({ tripId: tripDepartures.tripId })
      .from(tripDepartures)
      .where(eq(tripDepartures.id, booking.departureId))
      .limit(1);
    if (!departure || departure.tripId !== tripId) {
      return NextResponse.json({ error: "tripId tidak cocok dengan booking" }, { status: 400 });
    }

    // Field kepercayaan dipaksa dari server, bukan dari client
    const data = await reviewRepository.create({
      bookingId,
      userId: session.user.id,
      tripId,
      departureId: booking.departureId,
      rating,
      content,
      isVerifiedPurchase: false,
      isFeatured: false,
      status: "pending",
    });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
