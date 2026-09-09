import { paymentRepository } from "./payment.repository";
import { bookingRepository } from "../booking/booking.repository";
import { loyaltyService } from "../loyalty/loyalty.service";
import { db } from "@/shared/db";
import { referrals } from "@/modules/referral/referral.schema";
import { eq } from "drizzle-orm";
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

      // Handle referral conversion + loyalty points for referrer
      try {
        const [referral] = await db
          .select()
          .from(referrals)
          .where(eq(referrals.bookingId, payment.bookingId))
          .limit(1);

        if (referral && referral.status === "pending") {
          // Update referral status to converted
          await db
            .update(referrals)
            .set({ status: "converted" })
            .where(eq(referrals.id, referral.id));

          // Credit loyalty points to referrer
          if (referral.referrerId && referral.referredUserId) {
            await loyaltyService.creditReferralBonus(
              referral.referrerId as UUID,
              referral.referredUserId as UUID
            );
          }
        }
      } catch (e) {
        console.error("Failed to process referral conversion:", e);
      }
    } else {
      await paymentRepository.update(paymentId, { status: "rejected", ...reviewed });
      await bookingRepository.update(payment.bookingId, { status: "cancelled" });
    }

    return paymentRepository.findById(paymentId);
  },
};
