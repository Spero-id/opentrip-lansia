import { db } from "@/shared/db";
import { reviews } from "./review.schema";
import { bookings } from "../booking/booking.schema";
import { tripDepartures, trips } from "../trip/trip.schema";
import { users } from "../auth/auth.schema";
import { eq, desc, and, sql, inArray } from "drizzle-orm";
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
  isVerifiedPurchase: boolean;
  createdAt: Date;
  userName: string | null;
  tripTitle: string | null;
  tripId: string;
}

export interface IReviewRepository {
  findAll(): Promise<ReviewWithDetails[]>;
  findApproved(): Promise<PublicReview[]>;
  findApprovedByTripId(tripId: UUID): Promise<PublicReview[]>;
  findById(id: UUID): Promise<typeof reviews.$inferSelect | null>;
  create(data: typeof reviews.$inferInsert): Promise<typeof reviews.$inferSelect>;
  findByTripId(tripId: UUID): Promise<(typeof reviews.$inferSelect)[]>;
  findByUserId(userId: string): Promise<(typeof reviews.$inferSelect)[]>;
  update(id: UUID, data: Partial<typeof reviews.$inferInsert>): Promise<void>;
  delete(id: UUID): Promise<void>;
  /**
   * Sinkronkan trips.review_count & trips.rating dengan ulasan approved.
   * Dipanggil setiap kali status review berubah (approve/reject) atau review
   * dihapus — kalau tidak, kedua kolom itu tetap basi dan UI menampilkan
   * "(0 ulasan)" padahal ada ulasan.
   */
  recomputeTripStats(tripId: UUID): Promise<void>;
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
      isVerifiedPurchase: reviews.isVerifiedPurchase,
      createdAt: reviews.createdAt,
      userId: reviews.userId,
      tripId: reviews.tripId,
    })
    .from(reviews)
    .where(whereClause)
    .orderBy(desc(reviews.createdAt));

  if (rows.length === 0) return [];

  // Batch: 2 query untuk seluruh baris, bukan 2 query tiap baris (N+1)
  const userIds = [...new Set(rows.map((r) => r.userId))];
  const tripIds = [...new Set(rows.map((r) => r.tripId))];

  const [userRows, tripRows] = await Promise.all([
    db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, userIds)),
    db.select({ id: trips.id, title: trips.title }).from(trips).where(inArray(trips.id, tripIds)),
  ]);
  const nameByUserId = new Map(userRows.map((u) => [u.id, u.name]));
  const titleByTripId = new Map(tripRows.map((t) => [t.id, t.title]));

  return rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    content: r.content,
    isFeatured: r.isFeatured ?? false,
    isVerifiedPurchase: r.isVerifiedPurchase ?? false,
    createdAt: r.createdAt,
    userName: nameByUserId.get(r.userId) ?? null,
    tripTitle: titleByTripId.get(r.tripId) ?? null,
    tripId: r.tripId,
  }));
}

export const reviewRepository: IReviewRepository = {
  async findApproved() {
    return fetchApproved();
  },

  async findApprovedByTripId(tripId: UUID) {
    return fetchApproved(tripId);
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

    if (data.length === 0) return [];

    // Batch: 4 query untuk seluruh baris, bukan 4 query tiap baris (N+1)
    const userIds = [...new Set(data.map((r) => r.userId))];
    const tripIds = [...new Set(data.map((r) => r.tripId))];
    const departureIds = [
      ...new Set(data.map((r) => r.departureId).filter((v): v is string => !!v)),
    ];
    const bookingIds = [
      ...new Set(data.map((r) => r.bookingId).filter((v): v is string => !!v)),
    ];

    const [userRows, tripRows, departureRows, bookingRows] = await Promise.all([
      db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(inArray(users.id, userIds)),
      db.select({ id: trips.id, title: trips.title }).from(trips).where(inArray(trips.id, tripIds)),
      departureIds.length
        ? db
            .select({
              id: tripDepartures.id,
              startDate: tripDepartures.startDate,
              endDate: tripDepartures.endDate,
            })
            .from(tripDepartures)
            .where(inArray(tripDepartures.id, departureIds))
        : Promise.resolve([]),
      bookingIds.length
        ? db
            .select({ id: bookings.id, bookingCode: bookings.bookingCode })
            .from(bookings)
            .where(inArray(bookings.id, bookingIds))
        : Promise.resolve([]),
    ]);

    const userById = new Map(userRows.map((u) => [u.id, u]));
    const tripTitleById = new Map(tripRows.map((t) => [t.id, t.title]));
    const departureById = new Map(
      departureRows.map((d) => [d.id, d])
    );
    const bookingCodeById = new Map(
      bookingRows.map((b) => [b.id, b.bookingCode])
    );

    return data.map((r) => {
      const user = userById.get(r.userId);
      const departure = r.departureId ? departureById.get(r.departureId) : undefined;

      return {
        id: r.id,
        rating: r.rating,
        content: r.content,
        status: r.status ?? "pending",
        isFeatured: r.isFeatured ?? false,
        createdAt: r.createdAt,
        userName: user?.name ?? null,
        userEmail: user?.email ?? null,
        tripTitle: tripTitleById.get(r.tripId) ?? null,
        groupStartDate: departure?.startDate ?? null,
        groupEndDate: departure?.endDate ?? null,
        bookingCode: r.bookingId
          ? (bookingCodeById.get(r.bookingId) ?? null)
          : null,
      };
    });
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

  async recomputeTripStats(tripId) {
    const [agg] = await db
      .select({
        count: sql<number>`count(*)::int`,
        avg: sql<number | null>`ROUND(AVG(${reviews.rating})::numeric, 1)`,
      })
      .from(reviews)
      .where(and(eq(reviews.tripId, tripId), eq(reviews.status, "approved")));

    const count = Number(agg?.count ?? 0);
    const avg = agg?.avg != null ? Number(agg.avg) : null;

    await db
      .update(trips)
      .set({ reviewCount: count, rating: avg })
      .where(eq(trips.id, tripId));
  },
};
