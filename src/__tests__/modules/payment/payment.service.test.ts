import { paymentService } from "@/modules/payment/payment.service";
import { paymentRepository } from "@/modules/payment/payment.repository";
import { bookingRepository } from "@/modules/booking/booking.repository";

jest.mock("@/modules/payment/payment.repository", () => ({
  paymentRepository: {
    create: jest.fn(),
    findByBookingId: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.mock("@/modules/booking/booking.repository", () => ({
  bookingRepository: {
    update: jest.fn(),
  },
}));

describe("paymentService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createPayment", () => {
    it("creates payment with idempotency key", async () => {
      const created = { id: "payment-1", status: "pending" };
      (paymentRepository.create as jest.Mock).mockResolvedValue(created);

      const result = await paymentService.createPayment("booking-1", "bank_transfer", "3000000");

      expect(paymentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingId: "booking-1",
          method: "bank_transfer",
          amount: "3000000",
          status: "pending",
          idempotencyKey: expect.stringContaining("booking-1-"),
        })
      );
      expect(result).toEqual(created);
    });
  });

  describe("getPaymentsByBooking", () => {
    it("returns payments for booking", async () => {
      const payments = [{ id: "p1" }];
      (paymentRepository.findByBookingId as jest.Mock).mockResolvedValue(payments);

      const result = await paymentService.getPaymentsByBooking("booking-1");
      expect(result).toEqual(payments);
    });
  });

  describe("confirmPayment", () => {
    it("updates payment and confirms booking", async () => {
      const payment = { id: "payment-1", bookingId: "booking-1" };
      (paymentRepository.findById as jest.Mock).mockResolvedValue(payment);

      await paymentService.confirmPayment("payment-1");

      expect(paymentRepository.update).toHaveBeenCalledWith(
        "payment-1",
        expect.objectContaining({ status: "paid" })
      );
      expect(bookingRepository.update).toHaveBeenCalledWith(
        "booking-1",
        expect.objectContaining({ status: "confirmed" })
      );
    });
  });
});
