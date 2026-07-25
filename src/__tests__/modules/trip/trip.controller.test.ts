import { NextRequest } from "next/server";
import { tripController } from "@/modules/trip/trip.controller";
import { tripService } from "@/modules/trip/trip.service";

jest.mock("@/modules/trip/trip.service", () => ({
  tripService: {
    getAllTrips: jest.fn(),
    createTrip: jest.fn(),
  },
}));

jest.mock("@/shared/utils/helpers", () => ({
  slugify: jest.fn((s: string) => s.toLowerCase().replace(/\s+/g, "-")),
}));

describe("tripController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("returns all trips as JSON", async () => {
      const trips = [{ id: "1", title: "Trip A" }];
      (tripService.getAllTrips as jest.Mock).mockResolvedValue(trips);

      const response = await tripController.list();
      const data = await response.json();

      expect(data).toEqual(trips);
      expect(response.status).toBe(200);
    });
  });

  describe("create", () => {
    it("creates trip with slug", async () => {
      const body = { title: "New Trip", durationDays: 3 };
      const created = { id: "1", ...body, slug: "new-trip-1234567890" };
      (tripService.createTrip as jest.Mock).mockResolvedValue(created);

      const req = new NextRequest("http://localhost:3000/api/trips", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const response = await tripController.create(req);
      const data = await response.json();

      expect(data).toEqual(created);
      expect(response.status).toBe(201);
    });
  });
});
