import { db } from "@/shared/db";
import {
  trips, tripDepartures, tripPrices,
  itineraryItems, tripGalleries, galleryMedia,
  tripHoreca, tripVendors, tripMedia,
} from "./trip.schema";
import { destinationCategories } from "../master/master.schema";
import { eq, and, asc, desc, sql, getTableColumns, inArray } from "drizzle-orm";
import type { UUID } from "@/shared/types";

export interface TripWithPrice extends Omit<typeof trips.$inferSelect, "priceMin" | "priceMax"> {
  priceMin: number | null;
  priceMax: number | null;
  startDate: string | null;
  price: string | null;
  departureId: string | null;
  categoryName: string | null;
}

export type TripWithCategory = typeof trips.$inferSelect & { categoryName: string | null };

export interface ITripRepository {
  findAllPublished(): Promise<TripWithPrice[]>;
  findAll(): Promise<TripWithCategory[]>;
  findBySlug(slug: string): Promise<typeof trips.$inferSelect | null>;
  findById(id: UUID): Promise<typeof trips.$inferSelect | null>;
  findDeparturesByTripId(tripId: UUID): Promise<(typeof tripDepartures.$inferSelect)[]>;
  findPricesByDepartureId(departureId: UUID): Promise<(typeof tripPrices.$inferSelect)[]>;
  findCanonicalPriceByDepartureId(departureId: UUID): Promise<typeof tripPrices.$inferSelect | null>;
  create(data: typeof trips.$inferInsert): Promise<typeof trips.$inferSelect>;
  update(id: UUID, data: Partial<typeof trips.$inferInsert>): Promise<typeof trips.$inferSelect | null>;
  delete(id: UUID): Promise<void>;
  updateQuota(priceId: UUID, qty: number): Promise<boolean>;

  // Departure & price
  saveTripSchedules(
    tripId: UUID,
    schedules: { startDate: string; endDate: string; maxParticipants: number; price: number }[]
  ): Promise<void>;

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
        categoryName: destinationCategories.name,
      })
      .from(trips)
      .leftJoin(destinationCategories, eq(trips.categoryId, destinationCategories.id))
      .leftJoin(tripDepartures, eq(trips.id, tripDepartures.tripId))
      .leftJoin(tripPrices, and(eq(tripDepartures.id, tripPrices.departureId), eq(tripPrices.isActive, true)))
      .where(eq(trips.status, "published"))
      .orderBy(asc(tripDepartures.startDate));

    const byTrip = new Map<string, TripWithPrice>();
    const pricesByDeparture = new Map<string, { name: string; price: string }[]>();

    for (const r of rows) {
      if (r.departureId) {
        if (!pricesByDeparture.has(r.departureId)) pricesByDeparture.set(r.departureId, []);
        pricesByDeparture.get(r.departureId)!.push({ name: r.priceName ?? "", price: r.price ?? "" });
      }
      if (!byTrip.has(r.id)) {
        byTrip.set(r.id, {
          ...r,
          startDate: r.startDate,
          departureId: r.departureId,
          categoryName: r.categoryName ?? null,
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
    const rows = await db
      .select({
        id: trips.id,
        type: trips.type,
        title: trips.title,
        slug: trips.slug,
        description: trips.description,
        durationDays: trips.durationDays,
        status: trips.status,
        thumbnailId: trips.thumbnailId,
        sourceRequestId: trips.sourceRequestId,
        maxParticipants: trips.maxParticipants,
        meetingPointId: trips.meetingPointId,
        isFeatured: trips.isFeatured,
        categoryId: trips.categoryId,
        categoryName: destinationCategories.name,
        location: trips.location,
        province: trips.province,
        geoPoint: trips.geoPoint,
        isSeniorFriendly: trips.isSeniorFriendly,
        accessibilityInfo: trips.accessibilityInfo,
        visitEstimateMinutes: trips.visitEstimateMinutes,
        image: trips.image,
        rating: trips.rating,
        images: trips.images,
        reviewCount: trips.reviewCount,
        priceMin: trips.priceMin,
        priceMax: trips.priceMax,
        highlights: trips.highlights,
        facilities: trips.facilities,
        itinerary: trips.itinerary,
        meetingPointsJson: trips.meetingPointsJson,
        startDate: tripDepartures.startDate,
        departureId: tripDepartures.id,
        createdAt: trips.createdAt,
        updatedAt: trips.updatedAt,
      })
      .from(trips)
      .leftJoin(destinationCategories, eq(trips.categoryId, destinationCategories.id))
      .leftJoin(tripDepartures, eq(trips.id, tripDepartures.tripId))
      .orderBy(desc(trips.createdAt), asc(tripDepartures.startDate));

    const seen = new Set<string>();
    return rows.filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
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
    const [trip] = await db.select().from(trips).where(eq(trips.id, id)).limit(1);
    if (!trip) return;

    const departures = await db
      .select({ id: tripDepartures.id })
      .from(tripDepartures)
      .where(eq(tripDepartures.tripId, id));
    const departureIds = departures.map((d) => d.id);

    const galleries = await db
      .select({ id: tripGalleries.id })
      .from(tripGalleries)
      .where(eq(tripGalleries.tripId, id));
    const galleryIds = galleries.map((g) => g.id);

    if (departureIds.length > 0) {
      await db.delete(tripPrices).where(inArray(tripPrices.departureId, departureIds));
    }
    if (galleryIds.length > 0) {
      await db.delete(galleryMedia).where(inArray(galleryMedia.galleryId, galleryIds));
    }
    await db.delete(itineraryItems).where(eq(itineraryItems.tripId, id));
    await db.delete(tripHoreca).where(eq(tripHoreca.tripId, id));
    await db.delete(tripVendors).where(eq(tripVendors.tripId, id));
    await db.delete(tripMedia).where(eq(tripMedia.tripId, id));
    if (galleryIds.length > 0) {
      await db.delete(tripGalleries).where(inArray(tripGalleries.id, galleryIds));
    }
    if (departureIds.length > 0) {
      await db.delete(tripDepartures).where(inArray(tripDepartures.id, departureIds));
    }
    await db.delete(trips).where(eq(trips.id, id));
  },

  async updateQuota(priceId, qty) {
    const result = await db
      .update(tripPrices)
      .set({ quotaBooked: sql`${tripPrices.quotaBooked} + ${qty}` })
      .where(and(
        eq(tripPrices.id, priceId),
        eq(tripPrices.isActive, true),
        sql`${tripPrices.quotaBooked} + ${qty} <= ${tripPrices.quota}`,
      ));
    return (result.rowCount ?? 0) > 0;
  },

  async saveTripSchedules(tripId, schedules) {
    const existing = await db
      .select({ id: tripDepartures.id })
      .from(tripDepartures)
      .where(eq(tripDepartures.tripId, tripId));
    const existingIds = existing.map((d) => d.id);
    if (existingIds.length > 0) {
      await db.delete(tripPrices).where(inArray(tripPrices.departureId, existingIds));
      await db.delete(tripDepartures).where(inArray(tripDepartures.id, existingIds));
    }

    for (const s of schedules) {
      const [dep] = await db
        .insert(tripDepartures)
        .values({
          tripId,
          startDate: s.startDate,
          endDate: s.endDate,
          maxParticipants: s.maxParticipants,
          minParticipants: 1,
          status: "scheduled",
        })
        .returning();
      await db.insert(tripPrices).values({
        departureId: dep.id,
        name: "Dewasa",
        price: String(s.price),
        quota: s.maxParticipants,
        isActive: true,
      });
    }
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
