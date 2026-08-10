import { loyaltyRepository } from "./loyalty.repository";
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
};
