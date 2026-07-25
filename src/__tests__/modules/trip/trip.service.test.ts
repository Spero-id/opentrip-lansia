import { tripService } from "@/modules/trip/trip.service";
import { tripRepository } from "@/modules/trip/trip.repository";

jest.mock("@/modules/trip/trip.repository", () => ({
  tripRepository: {
    findAllPublished: jest.fn(),
    findAll: jest.fn(),
    findBySlug: jest.fn(),
    findDeparturesByTripId: jest.fn(),
    findPricesByDepartureId: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateQuota: jest.fn(),
  },
}));

describe("tripService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPublishedTrips", () => {
    it("returns published trips", async () => {
      const trips = [{ id: "1", title: "Trip A" }];
      (tripRepository.findAllPublished as jest.Mock).mockResolvedValue(trips);
      const result = await tripService.getPublishedTrips();
      expect(result).toEqual(trips);
    });
  });

  describe("getAllTrips", () => {
    it("returns all trips", async () => {
      const trips = [{ id: "1" }, { id: "2" }];
      (tripRepository.findAll as jest.Mock).mockResolvedValue(trips);
      const result = await tripService.getAllTrips();
      expect(result).toEqual(trips);
    });
  });

  describe("getTripBySlug", () => {
    it("returns trip with departures and prices", async () => {
      const trip = { id: "1", title: "Test Trip" };
      const departures = [{ id: "d1", tripId: "1" }];
      const prices = [{ id: "p1", departureId: "d1", price: "100000" }];

      (tripRepository.findBySlug as jest.Mock).mockResolvedValue(trip);
      (tripRepository.findDeparturesByTripId as jest.Mock).mockResolvedValue(departures);
      (tripRepository.findPricesByDepartureId as jest.Mock).mockResolvedValue(prices);

      const result = await tripService.getTripBySlug("test-trip");
      expect(result).toEqual({ trip, departures, prices });
    });

    it("returns null when trip not found", async () => {
      (tripRepository.findBySlug as jest.Mock).mockResolvedValue(null);
      const result = await tripService.getTripBySlug("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("reserveQuota", () => {
    it("reserves quota successfully", async () => {
      (tripRepository.updateQuota as jest.Mock).mockResolvedValue(true);
      const result = await tripService.reserveQuota("price-1", 2);
      expect(result).toBe(true);
    });
  });

  describe("createTrip", () => {
    it("creates a trip", async () => {
      const data = { title: "New Trip", durationDays: 3 };
      const created = { id: "1", ...data };
      (tripRepository.create as jest.Mock).mockResolvedValue(created);
      const result = await tripService.createTrip(data);
      expect(result).toEqual(created);
    });
  });

  describe("updateTrip", () => {
    it("updates a trip", async () => {
      const data = { title: "Updated" };
      (tripRepository.update as jest.Mock).mockResolvedValue({ id: "1", ...data });
      const result = await tripService.updateTrip("1", data);
      expect(result).toEqual({ id: "1", title: "Updated" });
    });
  });

  describe("deleteTrip", () => {
    it("deletes a trip", async () => {
      await tripService.deleteTrip("1");
      expect(tripRepository.delete).toHaveBeenCalledWith("1");
    });
  });
});
