import { paymentRepository } from "./payment.repository";
import { payments } from "./payment.schema";
import { bookings } from "../booking/booking.schema";
import { loyaltyService } from "../loyalty/loyalty.service";
import { siteSettingsService } from "../site-settings/site-settings.service";
import { withTransaction } from "@/shared/db/utils";
import { referrals } from "@/modules/referral/referral.schema";
import { eq } from "drizzle-orm";
import type { UUID } from "@/shared/types";

export const paymentService = {
  async getActiveAccounts() {
    return paymentRepository.findActiveAccounts();
  },

  async reviewPayment(paymentId: UUID, action: "approve" | "reject", note: string | null, adminId: string) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) return null;
    const reviewed = { adminNote: note || null, reviewedAt: new Date(), reviewedBy: adminId as UUID };

    if (action === "approve") {
      // Dibaca SEBELUM transaksi: kalau konfigurasi tidak bisa dibaca, belum ada
      // satu pun baris yang berubah (sebelumnya kegagalan terjadi di tengah,
      // setelah payment & referral terlanjur ter-update).
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

        // Poin dulu, penandaan `converted` kemudian. Kalau kredit poin gagal,
        // SELURUH transaksi ikut dibatalkan (payment & booking kembali) sehingga
        // referral tidak pernah berstatus converted tanpa poin masuk — kasus yang
        // sebelumnya membuat poin hilang permanen karena route menolak retry.
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
    }

    return paymentRepository.findById(paymentId);
  },
};
