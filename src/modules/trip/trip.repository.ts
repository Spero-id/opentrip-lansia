import { db } from "@/shared/db";
import {
  trips, tripDepartures, tripPrices,
  itineraryItems, tripGalleries,
} from "./trip.schema";
import { eq, and, asc, desc, sql, getTableColumns } from "drizzle-orm";
import type { UUID } from "@/shared/types";

export interface TripWithPrice extends Omit<typeof trips.$inferSelect, "priceMin" | "priceMax"> {
  priceMin: number | null;
  priceMax: number | null;
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
  findCanonicalPriceByDepartureId(departureId: UUID): Promise<typeof tripPrices.$inferSelect | null>;
  create(data: typeof trips.$inferInsert): Promise<typeof trips.$inferSelect>;
  update(id: UUID, data: Partial<typeof trips.$inferInsert>): Promise<typeof trips.$inferSelect | null>;
  delete(id: UUID): Promise<void>;
  updateQuota(priceId: UUID, qty: number): Promise<boolean>;

  // Itinerary
  findItineraryByTripId(tripId: UUID): Promise<(typeof itineraryItems.$inferSelect)[]>;
  saveItinerary(tripId: UUID, items: ItineraryInput[]): Promise<void>;

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
}

export function pickCanonicalPrice(prices: { name: string; price: string }[]): string | null {
  if (prices.length === 0) return null;
  const dewas = prices.find((p) => p.name === "Dewasa");
  return dewas?.price ?? prices[0].price;
}

export const tripRepository: ITripRepository = {
  async findAllPublished() {
    const rows = await db
      .select({
        ...getTableColumns(trips),
        startDate: tripDepartures.startDate,
        departureId: tripDepartures.id,
        price: tripPrices.price,
        priceName: tripPrices.name,
      })
      .from(trips)
      .leftJoin(tripDepartures, eq(trips.id, tripDepartures.tripId))
      .leftJoin(tripPrices, eq(tripDepartures.id, tripPrices.departureId))
      .where(and(eq(trips.status, "published"), eq(tripPrices.isActive, true)))
      .orderBy(asc(tripDepartures.startDate));

    const byTrip = new Map<string, TripWithPrice>();
    const pricesByDeparture = new Map<string, { name: string; price: string }[]>();

    for (const r of rows) {
      if (!r.departureId) continue;
      if (!pricesByDeparture.has(r.departureId)) pricesByDeparture.set(r.departureId, []);
      pricesByDeparture.get(r.departureId)!.push({ name: r.priceName ?? "", price: r.price ?? "" });
      if (!byTrip.has(r.id)) {
        byTrip.set(r.id, {
          ...r,
          startDate: r.startDate,
          departureId: r.departureId,
          price: null,
        });
      }
    }

    for (const row of byTrip.values()) {
      const prices = pricesByDeparture.get(row.departureId!) ?? [];
      row.price = pickCanonicalPrice(prices);
    }

    return [...byTrip.values()];
  },

  async findCanonicalPriceByDepartureId(departureId) {
    const rows = await db
      .select()
      .from(tripPrices)
      .where(and(eq(tripPrices.departureId, departureId), eq(tripPrices.isActive, true)));
    return rows.find((r) => r.name === "Dewasa") ?? rows[0] ?? null;
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
    await db.insert(itineraryItems).values(
      items.map((item) => ({
        tripId,
        dayNumber: Number(item.dayNumber) || 1,
        title: item.title || `Hari ${item.dayNumber || 1}`,
        description: item.description || null,
        startTime: item.startTime || null,
        endTime: item.endTime || null,
      }))
    );
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
