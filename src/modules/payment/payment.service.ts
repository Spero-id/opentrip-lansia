import { paymentRepository } from "./payment.repository";
import { bookingRepository } from "../booking/booking.repository";
import type { UUID } from "@/shared/types";

export const paymentService = {
  async createPayment(bookingId: UUID, method: string, amount: string) {
    const idempotencyKey = `${bookingId}-${Date.now()}`;

    const payment = await paymentRepository.create({
      bookingId,
      method,
      amount,
      idempotencyKey,
      status: "pending",
    });

    return payment;
  },

  async getPaymentsByBooking(bookingId: UUID) {
    return paymentRepository.findByBookingId(bookingId);
  },

  async confirmPayment(paymentId: UUID) {
    await paymentRepository.update(paymentId, { status: "paid", paidAt: new Date() });
    const payment = await paymentRepository.findById(paymentId);
    if (payment) {
      await bookingRepository.update(payment.bookingId, { status: "confirmed" });
    }
  },
};
