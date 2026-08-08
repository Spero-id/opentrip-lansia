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

  async getActiveAccounts() {
    return paymentRepository.findActiveAccounts();
  },

  async reviewPayment(paymentId: UUID, action: "approve" | "reject", note: string | null, adminId: string) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) return null;
    const reviewed = { adminNote: note || null, reviewedAt: new Date(), reviewedBy: adminId as UUID };

    if (action === "approve") {
      await paymentRepository.update(paymentId, { status: "paid", paidAt: new Date(), ...reviewed });
      await bookingRepository.update(payment.bookingId, { status: "confirmed" });
    } else {
      await paymentRepository.update(paymentId, { status: "rejected", ...reviewed });
      await bookingRepository.update(payment.bookingId, { status: "cancelled" });
    }

    return paymentRepository.findById(paymentId);
  },
};
