import { db } from "@/shared/db";
import { bookingRepository } from "@/modules/booking/booking.repository";

describe("bookingRepository", () => {
  const mockDb = jest.mocked(db);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findById", () => {
    it("returns booking when found", async () => {
      const booking = { id: "1", bookingCode: "OTL-001" };
      const chain = {
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([booking])),
          })),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await bookingRepository.findById("1");
      expect(result).toEqual(booking);
    });
  });

  describe("findByUserId", () => {
    it("returns bookings for user", async () => {
      const bookings = [{ id: "1", bookingCode: "OTL-001" }];
      const chain = {
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => Promise.resolve(bookings)),
          })),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await bookingRepository.findByUserId("user-1");
      expect(result).toEqual(bookings);
    });
  });

  describe("create", () => {
    it("inserts and returns booking", async () => {
      const booking = { id: "1", bookingCode: "OTL-001" };
      const chain = {
        values: jest.fn(() => ({
          returning: jest.fn(() => Promise.resolve([booking])),
        })),
      };
      (mockDb.insert as jest.Mock).mockReturnValue(chain);

      const result = await bookingRepository.create(booking as any);
      expect(result).toEqual(booking);
    });
  });

  describe("update", () => {
    it("updates booking", async () => {
      const chain = {
        set: jest.fn(() => ({
          where: jest.fn(() => Promise.resolve()),
        })),
      };
      (mockDb.update as jest.Mock).mockReturnValue(chain);

      await bookingRepository.update("1", { status: "confirmed" });
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe("createItems", () => {
    it("inserts multiple items", async () => {
      const chain = {
        values: jest.fn(() => Promise.resolve()),
      };
      (mockDb.insert as jest.Mock).mockReturnValue(chain);

      await bookingRepository.createItems([
        { bookingId: "1", tripPriceId: "p1", quantity: 2, unitPrice: "1000", subtotal: "2000" },
      ]);
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe("findItemsByBookingId", () => {
    it("returns items for booking", async () => {
      const items = [{ id: "item-1" }];
      const chain = {
        from: jest.fn(() => ({
          where: jest.fn(() => Promise.resolve(items)),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await bookingRepository.findItemsByBookingId("1");
      expect(result).toEqual(items);
    });
  });
});
