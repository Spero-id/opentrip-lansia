import { bookingService } from "@/modules/booking/booking.service";
import { bookingRepository } from "@/modules/booking/booking.repository";
import { tripRepository } from "@/modules/trip/trip.repository";

jest.mock("@/modules/booking/booking.repository", () => ({
  bookingRepository: {
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    createItems: jest.fn(),
    findItemsByBookingId: jest.fn(),
  },
}));

jest.mock("@/modules/trip/trip.repository", () => ({
  tripRepository: {
    updateQuota: jest.fn(),
  },
}));

jest.mock("@/shared/utils/helpers", () => ({
  generateCode: jest.fn(() => "OTL-TEST123"),
}));

describe("bookingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createBooking", () => {
    const userId = "user-1";
    const departureId = "departure-1";
    const items = [{ priceId: "price-1", qty: 2, price: "1500000" }];

    it("creates booking with items", async () => {
      (tripRepository.updateQuota as jest.Mock).mockResolvedValue(true);
      (bookingRepository.create as jest.Mock).mockResolvedValue({
        id: "booking-1",
        bookingCode: "OTL-TEST123",
        totalParticipants: 2,
        subtotal: "3000000",
        totalAmount: "3000000",
      });

      const result = await bookingService.createBooking(userId, departureId, items);

      expect(tripRepository.updateQuota).toHaveBeenCalledWith("price-1", 2);
      expect(bookingRepository.create).toHaveBeenCalled();
      expect(bookingRepository.createItems).toHaveBeenCalled();
      expect(result.bookingCode).toBe("OTL-TEST123");
    });

    it("throws when quota is exhausted", async () => {
      (tripRepository.updateQuota as jest.Mock).mockResolvedValue(false);

      await expect(
        bookingService.createBooking(userId, departureId, items)
      ).rejects.toThrow("Quota habis");
    });
  });

  describe("getBooking", () => {
    it("returns booking with items", async () => {
      const booking = { id: "booking-1" };
      const items = [{ id: "item-1" }];
      (bookingRepository.findById as jest.Mock).mockResolvedValue(booking);
      (bookingRepository.findItemsByBookingId as jest.Mock).mockResolvedValue(items);

      const result = await bookingService.getBooking("booking-1");
      expect(result).toEqual({ booking, items });
    });

    it("returns null when booking not found", async () => {
      (bookingRepository.findById as jest.Mock).mockResolvedValue(null);
      const result = await bookingService.getBooking("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("getUserBookings", () => {
    it("returns user bookings", async () => {
      const bookings = [{ id: "b1" }];
      (bookingRepository.findByUserId as jest.Mock).mockResolvedValue(bookings);
      const result = await bookingService.getUserBookings("user-1");
      expect(result).toEqual(bookings);
    });
  });

  describe("updateBookingStatus", () => {
    it("updates booking status", async () => {
      await bookingService.updateBookingStatus("booking-1", "confirmed");
      expect(bookingRepository.update).toHaveBeenCalledWith("booking-1", { status: "confirmed" });
    });
  });
});
