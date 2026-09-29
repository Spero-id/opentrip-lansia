import { loyaltyRepository } from "./loyalty.repository";
import { withTransaction, type Tx } from "@/shared/db/utils";
import type { UUID } from "@/shared/types";

const CASHBACK_POINTS = 25_000;
const POINTS_EXPIRY_YEARS = 1;

function buildExpiry(): Date {
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + POINTS_EXPIRY_YEARS);
  return expiresAt;
}

export const loyaltyService = {
  async creditCashback(userId: UUID, bookingId: UUID) {
    // Ledger dan saldo dalam SATU transaksi — kalau salah satu gagal, keduanya
    // ikut batal sehingga users.loyalty_points tidak pernah menyimpang dari
    // loyalty_transactions.
    await withTransaction(async (tx) => {
      await loyaltyRepository.createTransaction(
        {
          userId,
          points: CASHBACK_POINTS,
          type: "earn",
          referenceType: "booking",
          referenceId: bookingId,
          description: `Cashback pembayaran booking`,
          expiresAt: buildExpiry(),
        },
        tx
      );

      await loyaltyRepository.updateLoyaltyPoints(userId, CASHBACK_POINTS, tx);
    });
  },

  /**
   * Beri bonus referral. Wajib dipanggil dari dalam `withTransaction` —
   * `tx` diteruskan ke repository supaya ledger dan saldo ikut rollback
   * bersama kalau langkah berikutnya (mis. menandai referral converted) gagal.
   *
   * `points` dihitung pemanggil (site settings) supaya pembacaan konfigurasi
   * dilakukan SEBELUM transaksi dimulai.
   */
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
