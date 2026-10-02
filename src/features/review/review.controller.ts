import { NextRequest, NextResponse } from "next/server";
import { reviewRepository } from "./review.repository";
import { bookings } from "@/db/schema/bookings";
import { reviews } from "@/db/schema/reviews";
import { tripDepartures } from "@/db/schema/trips";
import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { auth } from "../auth/auth.config";
import { toPublicError } from "@/lib/errors/to-public-error";

type IdParams = { params: Promise<{ id: string }> };

async function idOf(ctx: IdParams): Promise<string> {
  const { id } = await ctx.params;
  return id;
}

function invalidReviewInput(body: { bookingId?: unknown; tripId?: unknown; rating?: unknown; content?: unknown }): string | { rating: number; content: string } {
  const bookingId = body.bookingId;
  const tripId = body.tripId;
  const rating = Number(body.rating);
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!bookingId || !tripId) return "bookingId dan tripId wajib diisi";
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return "Rating harus angka 1-5";
  if (!content) return "Isi ulasan wajib diisi";
  if (content.length > 2000) return "Ulasan maksimal 2000 karakter";
  return { rating, content };
}

export const reviewController = {
  async listApproved() {
    try {
      return NextResponse.json(await reviewRepository.findApproved());
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async listApprovedByTrip(tripId: string) {
    try {
      return NextResponse.json(await reviewRepository.findApprovedByTripId(tripId));
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async listAll() {
    try {
      return NextResponse.json(await reviewRepository.findAll());
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async create(req: NextRequest) {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const body = await req.json();
      const validated = invalidReviewInput(body);
      if (typeof validated === "string") {
        return NextResponse.json({ error: validated }, { status: 400 });
      }
      const { bookingId, tripId } = body;
      const { rating, content } = validated;

      const [booking] = await db
        .select({ departureId: bookings.departureId, status: bookings.status })
        .from(bookings)
        .where(and(eq(bookings.id, bookingId), eq(bookings.userId, session.user.id)))
        .limit(1);
      if (!booking) {
        return NextResponse.json({ error: "Booking tidak ditemukan atau bukan milik Anda" }, { status: 403 });
      }
      if (booking.status !== "completed") {
        return NextResponse.json({ error: "Ulasan hanya bisa diberikan setelah trip selesai" }, { status: 400 });
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
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async update(req: NextRequest, ctx: IdParams) {
    try {
      const id = await idOf(ctx);
      const body = await req.json();
      const updates: { status?: string; isFeatured?: boolean } = {};
      if ("status" in body) {
        if (!["pending", "approved", "rejected"].includes(body.status)) {
          return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
        }
        updates.status = body.status;
      }
      if ("isFeatured" in body) {
        if (typeof body.isFeatured !== "boolean") {
          return NextResponse.json({ error: "isFeatured harus boolean" }, { status: 400 });
        }
        updates.isFeatured = body.isFeatured;
      }
      if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: "Tidak ada field yang bisa diubah (status/isFeatured)" }, { status: 400 });
      }
      const before = await reviewRepository.findById(id);
      await reviewRepository.update(id, updates);
      if (before) {
        await reviewRepository.recomputeTripStats(before.tripId);
      }
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async remove(_req: NextRequest, ctx: IdParams) {
    try {
      const id = await idOf(ctx);
      const before = await reviewRepository.findById(id);
      await reviewRepository.delete(id);
      if (before) {
        await reviewRepository.recomputeTripStats(before.tripId);
      }
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },
};
