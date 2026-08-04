import { db } from "@/shared/db";
import {
  trips, tripDepartures, tripPrices, tripDestinations,
  itineraryItems, tripGalleries,
} from "./trip.schema";
import { eq, and, asc, desc, sql } from "drizzle-orm";
import type { UUID } from "@/shared/types";

export interface TripWithPrice {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  durationDays: number;
  startDate: string | null;
  price: string | null;
  departureId: string | null;
}

export interface ITripRepository {
  findAllPublished(): Promise<TripWithPrice[]>;
  findAll(): Promise<(typeof trips.$inferSelect)[]>;
  findBySlug(slug: string): Promise<typeof trips.$inferSelect | null>;
  findById(id: UUID): Promise<typeof trips.$inferSelect | null>;
  findDeparturesByTripId(tripId: UUID): Promise<(typeof tripDepartures.$inferSelect)[]>;
  findPricesByDepartureId(departureId: UUID): Promise<(typeof tripPrices.$inferSelect)[]>;
  create(data: typeof trips.$inferInsert): Promise<typeof trips.$inferSelect>;
  update(id: UUID, data: Partial<typeof trips.$inferInsert>): Promise<typeof trips.$inferSelect | null>;
  delete(id: UUID): Promise<void>;
  updateQuota(priceId: UUID, qty: number): Promise<boolean>;

  // Itinerary
  findItineraryByTripId(tripId: UUID): Promise<(typeof itineraryItems.$inferSelect)[]>;
  saveItinerary(tripId: UUID, items: ItineraryInput[]): Promise<void>;

  // Trip destinations
  findTripDestinations(tripId: UUID): Promise<(typeof tripDestinations.$inferSelect)[]>;
  saveTripDestinations(tripId: UUID, dests: DestinationInput[]): Promise<void>;

  // Galleries
  findAllGalleries(): Promise<(typeof tripGalleries.$inferSelect)[]>;
  findGalleryById(id: UUID): Promise<typeof tripGalleries.$inferSelect | null>;
  createGallery(data: typeof tripGalleries.$inferInsert): Promise<typeof tripGalleries.$inferSelect>;
  updateGallery(id: UUID, data: Partial<typeof tripGalleries.$inferInsert>): Promise<void>;
  deleteGallery(id: UUID): Promise<void>;
}

export interface ItineraryInput {
  dayNumber: number;
  startTime?: string | null;
  endTime?: string | null;
  title: string;
  description?: string | null;
  destinationId?: string | null;
}

export interface DestinationInput {
  destinationId: string;
  dayOrder: number;
  durationHours?: number | null;
  notes?: string | null;
}

export const tripRepository: ITripRepository = {
  async findAllPublished() {
    const rows = await db
      .select({
        id: trips.id,
        title: trips.title,
        slug: trips.slug,
        description: trips.description,
        durationDays: trips.durationDays,
        startDate: tripDepartures.startDate,
        price: tripPrices.price,
        departureId: tripDepartures.id,
      })
      .from(trips)
      .leftJoin(tripDepartures, eq(trips.id, tripDepartures.tripId))
      .leftJoin(tripPrices, eq(tripDepartures.id, tripPrices.departureId))
      .where(and(eq(trips.status, "published"), eq(tripPrices.isActive, true)))
      .orderBy(asc(tripDepartures.startDate));

    const map = new Map<string, TripWithPrice>();
    for (const r of rows) if (!map.has(r.id)) map.set(r.id, r);
    return [...map.values()];
  },

  async findBySlug(slug) {
    const [trip] = await db.select().from(trips).where(eq(trips.slug, slug)).limit(1);
    return trip ?? null;
  },

  async findById(id) {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id)).limit(1);
    return trip ?? null;
  },

  async findDeparturesByTripId(tripId) {
    return db.select().from(tripDepartures).where(eq(tripDepartures.tripId, tripId));
  },

  async findPricesByDepartureId(departureId) {
    return db.select().from(tripPrices).where(eq(tripPrices.departureId, departureId));
  },

  async findAll() {
    return db.select().from(trips).orderBy(desc(trips.createdAt));
  },

  async create(data) {
    const [trip] = await db.insert(trips).values(data).returning();
    return trip;
  },

  async update(id, data) {
    const [trip] = await db.update(trips).set(data).where(eq(trips.id, id)).returning();
    return trip ?? null;
  },

  async delete(id) {
    await db.delete(trips).where(eq(trips.id, id));
  },

  async updateQuota(priceId, qty) {
    const result = await db
      .update(tripPrices)
      .set({ quotaBooked: sql`${tripPrices.quotaBooked} + ${qty}` })
      .where(and(
        eq(tripPrices.id, priceId),
        eq(tripPrices.isActive, true),
      ));
    return (result.rowCount ?? 0) > 0;
  },

  async findItineraryByTripId(tripId) {
    return db
      .select()
      .from(itineraryItems)
      .where(eq(itineraryItems.tripId, tripId))
      .orderBy(asc(itineraryItems.dayNumber), asc(itineraryItems.startTime));
  },

  async saveItinerary(tripId, items) {
    await db.delete(itineraryItems).where(eq(itineraryItems.tripId, tripId));
    if (items.length === 0) return;
    await db.insert(itineraryItems).values(items.map((item) => ({ ...item, tripId })));
  },

  async findTripDestinations(tripId) {
    return db
      .select()
      .from(tripDestinations)
      .where(eq(tripDestinations.tripId, tripId))
      .orderBy(asc(tripDestinations.dayOrder));
  },

  async saveTripDestinations(tripId, dests) {
    await db.delete(tripDestinations).where(eq(tripDestinations.tripId, tripId));
    if (dests.length === 0) return;
    await db.insert(tripDestinations).values(dests.map((d) => ({ ...d, tripId })));
  },

  // Galleries
  async findAllGalleries() {
    return db.select().from(tripGalleries).orderBy(desc(tripGalleries.createdAt));
  },

  async findGalleryById(id) {
    const [g] = await db.select().from(tripGalleries).where(eq(tripGalleries.id, id)).limit(1);
    return g ?? null;
  },

  async createGallery(data) {
    const [g] = await db.insert(tripGalleries).values(data).returning();
    return g;
  },

  async updateGallery(id, data) {
    await db.update(tripGalleries).set(data).where(eq(tripGalleries.id, id));
  },

  async deleteGallery(id) {
    await db.delete(tripGalleries).where(eq(tripGalleries.id, id));
  },
};
