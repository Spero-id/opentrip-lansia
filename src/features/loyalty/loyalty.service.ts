import { loyaltyRepository } from "./loyalty.repository";
import type { Tx } from "@/lib/db/utils";
import type { UUID } from "@/types";

const POINTS_EXPIRY_YEARS = 1;

function buildExpiry(): Date {
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + POINTS_EXPIRY_YEARS);
  return expiresAt;
}

export const loyaltyService = {
  async creditReferralBonus(tx: Tx, referrerId: UUID, referredUserId: UUID, points: number) {
    await loyaltyRepository.createTransaction(
      {
        userId: referrerId,
        points,
        type: "earn",
        referenceType: "referral",
        referenceId: referredUserId,
        description: `Bonus referral dari pengguna baru`,
        expiresAt: buildExpiry(),
      },
      tx
    );

    await loyaltyRepository.updateLoyaltyPoints(referrerId, points, tx);
  },
};
