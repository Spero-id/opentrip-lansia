import { paymentRepository } from "./payment.repository";
import { payments } from "@/db/schema/payments";
import { bookings } from "@/db/schema/bookings";
import { loyaltyService } from "@/features/loyalty/loyalty.service";
import { siteSettingsService } from "@/features/site-settings/site-settings.service";
import { withTransaction } from "@/lib/db/utils";
import { referrals } from "@/db/schema/referral";
import { eq } from "drizzle-orm";
import type { UUID } from "@/types";

export const paymentService = {
  async getActiveAccounts() {
    return paymentRepository.findActiveAccounts();
  },

  async reviewPayment(paymentId: UUID, action: "approve" | "reject", note: string | null, adminId: string) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) return null;
    const reviewed = { adminNote: note || null, reviewedAt: new Date(), reviewedBy: adminId as UUID };

    if (action === "approve") {
      const bonusPoints = await siteSettingsService.getReferralBonusPoints();

      await withTransaction(async (tx) => {
        await tx
          .update(payments)
          .set({ status: "paid", paidAt: new Date(), ...reviewed })
          .where(eq(payments.id, paymentId));
        await tx
          .update(bookings)
          .set({ status: "confirmed" })
          .where(eq(bookings.id, payment.bookingId));

        const [referral] = await tx
          .select()
          .from(referrals)
          .where(eq(referrals.bookingId, payment.bookingId))
          .limit(1);
        if (!referral || referral.status !== "pending") return;

        if (referral.referrerId && referral.referredUserId) {
          await loyaltyService.creditReferralBonus(
            tx,
            referral.referrerId as UUID,
            referral.referredUserId as UUID,
            bonusPoints
          );
        }

        await tx
          .update(referrals)
          .set({ status: "converted" })
          .where(eq(referrals.id, referral.id));
      });
    } else {
      await withTransaction(async (tx) => {
        await tx
          .update(payments)
          .set({ status: "rejected", ...reviewed })
          .where(eq(payments.id, paymentId));
        await tx
          .update(bookings)
          .set({ status: "cancelled" })
          .where(eq(bookings.id, payment.bookingId));
      });
      const { bookingService } = await import("@/features/booking/booking.service");
      await bookingService.releaseBookingQuota(payment.bookingId);
    }

    return paymentRepository.findById(paymentId);
  },
};
