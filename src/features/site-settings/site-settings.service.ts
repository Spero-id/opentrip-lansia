import { siteSettingsRepository } from "./site-settings.repository";

const DEFAULT_REFERRAL_BONUS = 10000;

export const siteSettingsService = {
  async getReferralBonusPoints(): Promise<number> {
    const val = await siteSettingsRepository.get("referral_bonus_points");
    if (val === null) return DEFAULT_REFERRAL_BONUS;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? DEFAULT_REFERRAL_BONUS : parsed;
  },

  async setReferralBonusPoints(points: number): Promise<void> {
    await siteSettingsRepository.set(
      "referral_bonus_points",
      String(points),
      "Jumlah poin bonus yang diberikan ke referrer saat referral berhasil"
    );
  },

  async getAllSettings() {
    return siteSettingsRepository.getAll();
  },
};
