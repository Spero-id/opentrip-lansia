import { db } from "@/shared/db";
import { reviews } from "./review.schema";
import { bookings } from "../booking/booking.schema";
import { tripDepartures, trips } from "../trip/trip.schema";
import { users } from "../auth/auth.schema";
import { eq, desc, and, sql } from "drizzle-orm";
import type { UUID } from "@/shared/types";

export interface ReviewWithDetails {
  id: string;
  rating: number;
  content: string | null;
  status: string;
  isFeatured: boolean;
  createdAt: Date;
  // User info
  userName: string | null;
  userEmail: string | null;
  // Trip info
  tripTitle: string | null;
  // Group/Departure info
  groupStartDate: string | null;
  groupEndDate: string | null;
  // Booking info
  bookingCode: string | null;
}

export interface PublicReview {
  id: string;
  rating: number;
  content: string | null;
  isFeatured: boolean;
  createdAt: Date;
  userName: string | null;
  tripTitle: string | null;
  tripId: string;
}

export interface IReviewRepository {
  findAll(): Promise<ReviewWithDetails[]>;
  findApproved(): Promise<PublicReview[]>;
  findApprovedByTripId(tripId: UUID): Promise<PublicReview[]>;
  findAverageRatingByTripId(tripId: UUID): Promise<number | null>;
  findById(id: UUID): Promise<typeof reviews.$inferSelect | null>;
  create(data: typeof reviews.$inferInsert): Promise<typeof reviews.$inferSelect>;
  findByTripId(tripId: UUID): Promise<(typeof reviews.$inferSelect)[]>;
  findByUserId(userId: string): Promise<(typeof reviews.$inferSelect)[]>;
  update(id: UUID, data: Partial<typeof reviews.$inferInsert>): Promise<void>;
  delete(id: UUID): Promise<void>;
}

async function fetchApproved(tripId?: string): Promise<PublicReview[]> {
  const whereClause = tripId
    ? and(eq(reviews.status, "approved"), eq(reviews.tripId, tripId))
    : eq(reviews.status, "approved");

  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      content: reviews.content,
      isFeatured: reviews.isFeatured,
      createdAt: reviews.createdAt,
      userId: reviews.userId,
      tripId: reviews.tripId,
    })
    .from(reviews)
    .where(whereClause)
    .orderBy(desc(reviews.createdAt));

  const result: PublicReview[] = [];
  for (const r of rows) {
    const [user] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, r.userId))
      .limit(1);
    const [trip] = await db
      .select({ title: trips.title })
      .from(trips)
      .where(eq(trips.id, r.tripId))
      .limit(1);
    result.push({
      id: r.id,
      rating: r.rating,
      content: r.content,
      isFeatured: r.isFeatured ?? false,
      createdAt: r.createdAt,
      userName: user?.name ?? null,
      tripTitle: trip?.title ?? null,
      tripId: r.tripId,
    });
  }
  return result;
}

export const reviewRepository: IReviewRepository = {
  async findApproved() {
    return fetchApproved();
  },

  async findApprovedByTripId(tripId: UUID) {
    return fetchApproved(tripId);
  },

  async findAverageRatingByTripId(tripId: UUID): Promise<number | null> {
    const [result] = await db
      .select({ avg: sql<number>`ROUND(AVG(${reviews.rating})::numeric, 1)` })
      .from(reviews)
      .where(and(eq(reviews.tripId, tripId), eq(reviews.status, "approved")));
    return result?.avg ?? null;
  },

  async findAll() {
    const data = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        content: reviews.content,
        status: reviews.status,
        isFeatured: reviews.isFeatured,
        createdAt: reviews.createdAt,
        userId: reviews.userId,
        tripId: reviews.tripId,
        departureId: reviews.departureId,
        bookingId: reviews.bookingId,
      })
      .from(reviews)
      .orderBy(desc(reviews.createdAt));

    // Enrich with user, trip, and departure info
    const enriched: ReviewWithDetails[] = [];
    for (const r of data) {
      let userName: string | null = null;
      let userEmail: string | null = null;
      let tripTitle: string | null = null;
      let groupStartDate: string | null = null;
      let groupEndDate: string | null = null;
      let bookingCode: string | null = null;

      // Get user info
      const [user] = await db
        .select({ name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, r.userId))
        .limit(1);
      if (user) {
        userName = user.name;
        userEmail = user.email;
      }

      // Get trip info
      const [trip] = await db
        .select({ title: trips.title })
        .from(trips)
        .where(eq(trips.id, r.tripId))
        .limit(1);
      if (trip) {
        tripTitle = trip.title;
      }

      // Get departure/group info
      if (r.departureId) {
        const [departure] = await db
          .select({ startDate: tripDepartures.startDate, endDate: tripDepartures.endDate })
          .from(tripDepartures)
          .where(eq(tripDepartures.id, r.departureId))
          .limit(1);
        if (departure) {
          groupStartDate = departure.startDate;
          groupEndDate = departure.endDate;
        }
      }

      // Get booking code
      if (r.bookingId) {
        const [booking] = await db
          .select({ bookingCode: bookings.bookingCode })
          .from(bookings)
          .where(eq(bookings.id, r.bookingId))
          .limit(1);
        if (booking) {
          bookingCode = booking.bookingCode;
        }
      }

      enriched.push({
        id: r.id,
        rating: r.rating,
        content: r.content,
        status: r.status ?? "pending",
        isFeatured: r.isFeatured ?? false,
        createdAt: r.createdAt,
        userName,
        userEmail,
        tripTitle,
        groupStartDate,
        groupEndDate,
        bookingCode,
      });
    }

    return enriched;
  },

  async findById(id) {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
    return review ?? null;
  },

  async create(data) {
    const [review] = await db.insert(reviews).values(data).returning();
    return review;
  },

  async findByTripId(tripId) {
    return db.select().from(reviews).where(eq(reviews.tripId, tripId));
  },

  async findByUserId(userId) {
    return db.select().from(reviews).where(eq(reviews.userId, userId));
  },

  async update(id, data) {
    await db.update(reviews).set(data).where(eq(reviews.id, id));
  },

  async delete(id) {
    await db.delete(reviews).where(eq(reviews.id, id));
  },
};
