import { tripRepository } from "./trip.repository";
import type { UUID } from "@/types";
import type { trips, itineraryItems } from "@/db/schema/trips";
import type { GroupCreateInput } from "./trip.repository";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors/app-error";

type TripInsert = typeof trips.$inferInsert;
type ItineraryInsert = typeof itineraryItems.$inferInsert;

interface TripDepartureInput {
  startDate: string;
  maxParticipants?: number | null;
}

interface TripCreateInput extends Omit<TripInsert, "id" | "createdAt" | "updatedAt"> {
  itineraryItems?: Omit<ItineraryInsert, "id" | "tripId">[];
  departures?: TripDepartureInput[];
  price?: number;
}

function addDays(dateISO: string, days: number): string {
  const d = new Date(dateISO + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export interface PriceTierInput {
  name: string;
  price: number | string;
  quota: number;
  validFrom?: string | null;
  validUntil?: string | null;
  isActive?: boolean;
}

export interface NormalizedPriceTier {
  name: string;
  price: string;
  quota: number;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
}

export function normalizePriceInput(input: PriceTierInput): NormalizedPriceTier {
  const name = (input.name || "").trim();
  if (!name) throw new ValidationError("Nama tier wajib diisi");
  if (name.length > 100) throw new ValidationError("Nama tier maksimal 100 karakter");
  const digits = String(input.price ?? "").replace(/\D/g, "");
  if (!digits || Number(digits) <= 0) throw new ValidationError("Harga tier harus lebih dari 0");
  const quota = Number(input.quota);
  if (!Number.isInteger(quota) || quota < 1) throw new ValidationError("Kuota tier minimal 1");
  const validFrom = input.validFrom || null;
  const validUntil = input.validUntil || null;
  if (validFrom && validUntil && validUntil < validFrom) {
    throw new ValidationError("Tanggal selesai harus setelah tanggal mulai");
  }
  return { name, price: digits, quota, validFrom, validUntil, isActive: input.isActive ?? true };
}

export const tripService = {
  async getPublishedTrips() {
    return tripRepository.findAllPublished();
  },

  async getFeaturedTrips() {
    return tripRepository.findFeatured();
  },

  async getAllTrips() {
    return tripRepository.findAll();
  },

  async getTripBySlug(slug: string) {
    const trip = await tripRepository.findBySlug(slug);
    if (!trip) return null;

    const departures = await tripRepository.findDeparturesByTripId(trip.id);
    const prices = departures.length > 0
      ? await tripRepository.findPricesByDepartureId(departures[0].id)
      : [];

    return { trip, departures, prices };
  },

  async getPricesByDeparture(departureId: UUID) {
    return tripRepository.findPricesByDepartureId(departureId);
  },

  async createPrice(tripId: UUID, groupId: UUID, input: PriceTierInput) {
    const group = await tripRepository.findGroupById(groupId);
    if (!group || group.tripId !== tripId) throw new NotFoundError("Grup");
    const data = normalizePriceInput(input);
    const siblings = await tripRepository.findPricesByDepartureId(groupId);
    if (siblings.some((s) => s.name.toLowerCase() === data.name.toLowerCase())) {
      throw new ConflictError(`Tier "${data.name}" sudah ada di grup ini`);
    }
    return tripRepository.createPrice({
      departureId: groupId,
      name: data.name,
      price: data.price,
      currency: "IDR",
      quota: data.quota,
      quotaBooked: 0,
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      isActive: data.isActive,
    });
  },

  async updatePrice(tripId: UUID, groupId: UUID, priceId: UUID, input: Partial<PriceTierInput>) {
    const group = await tripRepository.findGroupById(groupId);
    if (!group || group.tripId !== tripId) throw new NotFoundError("Grup");
    const price = await tripRepository.findPriceById(priceId);
    if (!price || price.departureId !== groupId) throw new NotFoundError("Tier harga");
    const data = normalizePriceInput({ name: price.name, price: price.price, quota: price.quota, ...input });
    if (input.name !== undefined) {
      const siblings = await tripRepository.findPricesByDepartureId(groupId);
      if (siblings.some((s) => s.id !== priceId && s.name.toLowerCase() === data.name.toLowerCase())) {
        throw new ConflictError(`Tier "${data.name}" sudah ada di grup ini`);
      }
    }
    if (data.quota < (price.quotaBooked ?? 0)) {
      throw new ConflictError(`Kuota tidak boleh lebih kecil dari ${price.quotaBooked} kursi terisi`);
    }
    return tripRepository.updatePrice(priceId, {
      name: data.name,
      price: data.price,
      quota: data.quota,
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      isActive: data.isActive,
    });
  },

  async deletePrice(tripId: UUID, groupId: UUID, priceId: UUID) {
    const group = await tripRepository.findGroupById(groupId);
    if (!group || group.tripId !== tripId) throw new NotFoundError("Grup");
    const price = await tripRepository.findPriceById(priceId);
    if (!price || price.departureId !== groupId) throw new NotFoundError("Tier harga");
    if ((price.quotaBooked ?? 0) > 0) {
      throw new ConflictError("Tier yang sudah memiliki booking tidak bisa dihapus (nonaktifkan saja)");
    }
    const siblings = await tripRepository.findPricesByDepartureId(groupId);
    if (siblings.length <= 1) {
      throw new ConflictError("Grup harus memiliki minimal satu tier harga");
    }
    return tripRepository.deletePrice(priceId);
  },

  async reserveQuota(priceId: UUID, qty: number): Promise<boolean> {
    return tripRepository.updateQuota(priceId, qty);
  },

  async createTrip(data: TripCreateInput) {
    const { itineraryItems, departures, price, ...tripData } = data;
    const trip = await tripRepository.create(tripData);

    if (itineraryItems?.length) {
      await tripRepository.saveItinerary(trip.id, itineraryItems);
    }

    if (departures !== undefined && price && price > 0) {
      await tripRepository.saveTripSchedules(
        trip.id,
        departures.map((d) => ({
          startDate: d.startDate,
          endDate: addDays(d.startDate, (tripData.durationDays || 1) - 1),
          maxParticipants: d.maxParticipants || 10,
          price,
        }))
      );
    }

    return this.getFullTrip(trip.id);
  },

  async updateTrip(id: UUID, data: TripCreateInput) {
    const { itineraryItems, departures, price, ...tripData } = data;
    const trip = await tripRepository.update(id, tripData);
    if (!trip) return null;

    if (itineraryItems !== undefined) {
      await tripRepository.saveItinerary(id, itineraryItems);
    }

    if (departures !== undefined && price && price > 0) {
      await tripRepository.saveTripSchedules(
        trip.id,
        departures.map((d) => ({
          startDate: d.startDate,
          endDate: addDays(d.startDate, (tripData.durationDays || 1) - 1),
          maxParticipants: d.maxParticipants || 10,
          price,
        }))
      );
    }

    return this.getFullTrip(id);
  },

  async getFullTrip(id: UUID) {
    const trip = await tripRepository.findById(id);
    if (!trip) return null;
    const itinerary = await tripRepository.findItineraryByTripId(id);
    return { ...trip, itinerary };
  },

  async getTripWithDepartures(id: UUID) {
    const trip = await tripRepository.findById(id);
    if (!trip) return null;
    const departures = await tripRepository.findDeparturesByTripId(id);
    return {
      ...trip,
      departures: departures.map((d) => ({
        id: d.id,
        startDate: d.startDate,
        maxParticipants: d.maxParticipants,
      })),
    };
  },

  async deleteTrip(id: UUID) {
    return tripRepository.delete(id);
  },

  async getTripGroups(tripId: UUID) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) throw new NotFoundError("Trip");
    const groups = await tripRepository.findAllGroupsByTripId(tripId);
    return { trip, groups };
  },

  async getGroupById(groupId: UUID) {
    return tripRepository.findGroupById(groupId);
  },

  async createGroup(tripId: UUID, data: GroupCreateInput) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) throw new NotFoundError("Trip");
    return tripRepository.createGroup(tripId, data);
  },

  async updateGroup(groupId: UUID, data: Partial<GroupCreateInput>) {
    const group = await tripRepository.findGroupById(groupId);
    if (!group) throw new NotFoundError("Grup");

    const updateData: Record<string, unknown> = {};
    if (data.startDate) updateData.startDate = data.startDate;
    if (data.endDate) updateData.endDate = data.endDate;
    if (data.maxParticipants !== undefined) updateData.maxParticipants = data.maxParticipants;
    if (data.minParticipants !== undefined) updateData.minParticipants = data.minParticipants;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return tripRepository.updateGroup(groupId, updateData);
  },

  async deleteGroup(groupId: UUID) {
    const group = await tripRepository.findGroupById(groupId);
    if (!group) throw new NotFoundError("Grup");

    const bookingCount = await tripRepository.countBookingsByDepartureId(groupId);
    if (bookingCount > 0) {
      throw new ConflictError("Tidak bisa menghapus grup yang sudah memiliki booking aktif");
    }

    return tripRepository.deleteGroup(groupId);
  },

  async activateGroup(tripId: UUID, groupId: UUID) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) throw new NotFoundError("Trip");

    const group = await tripRepository.findGroupById(groupId);
    if (!group) throw new NotFoundError("Grup");

    if (group.tripId !== tripId) throw new ValidationError("Grup tidak termasuk dalam trip ini");

    if (!["scheduled", "confirmed"].includes(group.status)) {
      throw new ValidationError("Hanya grup dengan status scheduled atau confirmed yang bisa diaktifkan");
    }

    return tripRepository.activateGroup(tripId, groupId);
  },

  async getActiveGroupInfo(tripId: UUID) {
    return tripRepository.getActiveGroupWithPrice(tripId);
  },

  async getGroupParticipants(departureId: UUID) {
    return tripRepository.findBookingsWithDetailsByDepartureId(departureId);
  },
};
