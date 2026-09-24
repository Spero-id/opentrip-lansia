import { loyaltyRepository } from "./loyalty.repository";
import { siteSettingsService } from "@/modules/site-settings/site-settings.service";
import type { UUID } from "@/shared/types";

const CASHBACK_POINTS = 25_000;
const POINTS_EXPIRY_YEARS = 1;

export const loyaltyService = {
  async creditCashback(userId: UUID, bookingId: UUID) {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + POINTS_EXPIRY_YEARS);

    await loyaltyRepository.createTransaction({
      userId,
      points: CASHBACK_POINTS,
      type: "earn",
      referenceType: "booking",
      referenceId: bookingId,
      description: `Cashback pembayaran booking`,
      expiresAt,
    });

    await loyaltyRepository.updateLoyaltyPoints(userId, CASHBACK_POINTS);
  },

  async creditReferralBonus(referrerId: UUID, referredUserId: UUID) {
    const referralBonusPoints = await siteSettingsService.getReferralBonusPoints();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + POINTS_EXPIRY_YEARS);

    await loyaltyRepository.createTransaction({
      userId: referrerId,
      points: referralBonusPoints,
      type: "earn",
      referenceType: "referral",
      referenceId: referredUserId,
      description: `Bonus referral dari pengguna baru`,
      expiresAt,
    });

    await loyaltyRepository.updateLoyaltyPoints(referrerId, referralBonusPoints);
  },
};
