import { NextRequest } from "next/server";
import { bookingController } from "@/modules/booking/booking.controller";
import { bookingService } from "@/modules/booking/booking.service";

jest.mock("@/modules/booking/booking.service", () => ({
  bookingService: {
    createBooking: jest.fn(),
  },
}));

describe("bookingController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("creates booking from request", async () => {
      const booking = { id: "booking-1", bookingCode: "OTL-001" };
      (bookingService.createBooking as jest.Mock).mockResolvedValue(booking);

      const req = new NextRequest("http://localhost:3000/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          departureId: "departure-1",
          items: [{ priceId: "price-1", qty: 2, price: "1500000" }],
        }),
      });
      req.headers.set("x-user-id", "user-1");

      const response = await bookingController.create(req);
      const data = await response.json();

      expect(data).toEqual(booking);
      expect(response.status).toBe(200);
    });

    it("returns error when booking fails", async () => {
      (bookingService.createBooking as jest.Mock).mockRejectedValue(new Error("Quota habis"));

      const req = new NextRequest("http://localhost:3000/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          departureId: "departure-1",
          items: [{ priceId: "price-1", qty: 10, price: "1500000" }],
        }),
      });

      const response = await bookingController.create(req);
      const data = await response.json();

      expect(data).toEqual({ error: "Quota habis" });
      expect(response.status).toBe(400);
    });
  });
});
