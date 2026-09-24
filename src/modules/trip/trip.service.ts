import { tripRepository } from "./trip.repository";
import type { UUID } from "@/shared/types";
import type { trips, itineraryItems } from "./trip.schema";
import type { GroupCreateInput } from "./trip.repository";

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

export const tripService = {
  async getPublishedTrips() {
    return tripRepository.findAllPublished();
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

  // Group Trip Management
  async getTripGroups(tripId: UUID) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) throw new Error("Trip tidak ditemukan");
    const groups = await tripRepository.findAllGroupsByTripId(tripId);
    return { trip, groups };
  },

  async getGroupById(groupId: UUID) {
    return tripRepository.findGroupById(groupId);
  },

  async createGroup(tripId: UUID, data: GroupCreateInput) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) throw new Error("Trip tidak ditemukan");
    return tripRepository.createGroup(tripId, data);
  },

  async updateGroup(groupId: UUID, data: Partial<GroupCreateInput>) {
    const group = await tripRepository.findGroupById(groupId);
    if (!group) throw new Error("Grup tidak ditemukan");

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
    if (!group) throw new Error("Grup tidak ditemukan");

    // Check if there are active bookings
    const bookingCount = await tripRepository.countBookingsByDepartureId(groupId);
    if (bookingCount > 0) {
      throw new Error("Tidak bisa menghapus grup yang sudah memiliki booking aktif");
    }

    return tripRepository.deleteGroup(groupId);
  },

  async activateGroup(tripId: UUID, groupId: UUID) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) throw new Error("Trip tidak ditemukan");

    const group = await tripRepository.findGroupById(groupId);
    if (!group) throw new Error("Grup tidak ditemukan");

    if (group.tripId !== tripId) throw new Error("Grup tidak termasuk dalam trip ini");

    // Only scheduled or confirmed groups can be activated
    if (!["scheduled", "confirmed"].includes(group.status)) {
      throw new Error("Hanya grup dengan status scheduled atau confirmed yang bisa diaktifkan");
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
