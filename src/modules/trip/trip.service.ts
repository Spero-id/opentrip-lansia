import { tripRepository } from "./trip.repository";
import type { UUID } from "@/shared/types";

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

  async createTrip(data: any) {
    const { itinerary, tripDestinations: dests, ...tripData } = data;
    const trip = await tripRepository.create(tripData);

    if (dests?.length) {
      await tripRepository.saveTripDestinations(trip.id, dests);
    }
    if (itinerary?.length) {
      await tripRepository.saveItinerary(trip.id, itinerary);
    }

    return this.getFullTrip(trip.id);
  },

  async updateTrip(id: UUID, data: any) {
    const { itinerary, tripDestinations: dests, ...tripData } = data;
    const trip = await tripRepository.update(id, tripData);
    if (!trip) return null;

    if (dests !== undefined) {
      await tripRepository.saveTripDestinations(id, dests);
    }
    if (itinerary !== undefined) {
      await tripRepository.saveItinerary(id, itinerary);
    }

    return this.getFullTrip(id);
  },

  async getFullTrip(id: UUID) {
    const trip = await tripRepository.findById(id);
    if (!trip) return null;
    const itinerary = await tripRepository.findItineraryByTripId(id);
    const tripDestinations = await tripRepository.findTripDestinations(id);
    return { ...trip, itinerary, tripDestinations };
  },

  async deleteTrip(id: UUID) {
    return tripRepository.delete(id);
  },
};
