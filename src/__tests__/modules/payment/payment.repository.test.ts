import { db } from "@/shared/db";
import { paymentRepository } from "@/modules/payment/payment.repository";

describe("paymentRepository", () => {
  const mockDb = jest.mocked(db);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findById", () => {
    it("returns payment when found", async () => {
      const payment = { id: "1", amount: "100000" };
      const chain = {
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([payment])),
          })),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await paymentRepository.findById("1");
      expect(result).toEqual(payment);
    });
  });

  describe("findByBookingId", () => {
    it("returns payments for booking", async () => {
      const payments = [{ id: "p1" }];
      const chain = {
        from: jest.fn(() => ({
          where: jest.fn(() => Promise.resolve(payments)),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await paymentRepository.findByBookingId("booking-1");
      expect(result).toEqual(payments);
    });
  });

  describe("create", () => {
    it("inserts and returns payment", async () => {
      const payment = { id: "1", amount: "100000" };
      const chain = {
        values: jest.fn(() => ({
          returning: jest.fn(() => Promise.resolve([payment])),
        })),
      };
      (mockDb.insert as jest.Mock).mockReturnValue(chain);

      const result = await paymentRepository.create(payment as any);
      expect(result).toEqual(payment);
    });
  });

  describe("update", () => {
    it("updates payment", async () => {
      const chain = {
        set: jest.fn(() => ({
          where: jest.fn(() => Promise.resolve()),
        })),
      };
      (mockDb.update as jest.Mock).mockReturnValue(chain);

      await paymentRepository.update("1", { status: "paid" });
      expect(mockDb.update).toHaveBeenCalled();
    });
  });
});
