import { tripRepository } from "./trip.repository";
import type { UUID } from "@/shared/types";
import type { trips, itineraryItems } from "./trip.schema";

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
};
