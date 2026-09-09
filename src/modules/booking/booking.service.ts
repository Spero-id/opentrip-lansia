import { bookingRepository } from "./booking.repository";
import { tripRepository } from "../trip/trip.repository";
import { reviewRepository } from "../review/review.repository";
import { tripDepartures } from "../trip/trip.schema";
import { db } from "@/shared/db";
import { eq } from "drizzle-orm";
import { generateCode } from "@/shared/utils/helpers";
import type { UUID } from "@/shared/types";

export interface BookingItemInput {
  priceId: string;
  qty: number;
  price: string;
}

export interface BookingParticipantInput {
  fullName: string;
  phone: string;
  isChild: boolean;
}

export const bookingService = {
  async createBooking(userId: UUID, departureId: UUID, items: BookingItemInput[], participants?: BookingParticipantInput[]) {
    const totalAmount = items.reduce((s, i) => s + parseInt(i.price) * i.qty, 0);
    const totalPax = items.reduce((s, i) => s + i.qty, 0);

    for (const item of items) {
      const ok = await tripRepository.updateQuota(item.priceId as UUID, item.qty);
      if (!ok) throw new Error(`Quota habis untuk item ${item.priceId}`);
    }

    const bookingCode = generateCode("OTL");
    const booking = await bookingRepository.create({
      bookingCode,
      userId,
      departureId,
      status: "pending",
      totalParticipants: totalPax,
      subtotal: String(totalAmount),
      totalAmount: String(totalAmount),
    });

    await bookingRepository.createItems(
      items.map((item) => ({
        bookingId: booking.id,
        tripPriceId: item.priceId,
        quantity: item.qty,
        unitPrice: item.price,
        subtotal: String(parseInt(item.price) * item.qty),
      }))
    );

    if (participants && participants.length > 0) {
      await bookingRepository.createParticipants(
        participants.map((p, idx) => ({
          bookingId: booking.id,
          fullName: p.fullName,
          phone: p.isChild ? "" : p.phone,
          isPrimary: idx === 0,
        }))
      );
    }

    return booking;
  },

  async getBooking(id: UUID) {
    const booking = await bookingRepository.findById(id);
    if (!booking) return null;
    const items = await bookingRepository.findItemsByBookingId(id);
    return { booking, items };
  },

  async getAllBookings() {
    const list = await bookingRepository.findAll();
    return Promise.all(list.map(withDetails));
  },

  async getUserBookings(userId: UUID, email?: string) {
    const list = await bookingRepository.findByUserIdOrEmail(userId, email);
    return Promise.all(list.map(withDetails));
  },

  async updateBookingStatus(id: UUID, status: string) {
    await bookingRepository.update(id, { status });
  },
};

async function withDetails(b: typeof import("../booking/booking.schema").bookings.$inferSelect) {
  const [participants, items, paymentsList, departure] = await Promise.all([
    bookingRepository.findParticipantsByBookingId(b.id),
    bookingRepository.findItemsByBookingId(b.id),
    bookingRepository.findPaymentsByBookingId(b.id),
    // Get departure to include tripId
    (async () => {
      const [dep] = await db
        .select({ tripId: tripDepartures.tripId })
        .from(tripDepartures)
        .where(eq(tripDepartures.id, b.departureId))
        .limit(1);
      return dep;
    })(),
  ]);

  // Check if review exists
  let hasReview = false;
  try {
    const userReviews = await reviewRepository.findByUserId(b.userId);
    hasReview = userReviews.some((r) => r.bookingId === b.id);
  } catch {
    // Ignore errors
  }

  return {
    ...b,
    tripId: departure?.tripId || null,
    participants,
    items,
    payments: paymentsList,
    hasReview,
  };
}
