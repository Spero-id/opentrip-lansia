import { promotionRepository } from "./promotion.repository";
import { ConflictError, ValidationError } from "@/utils/errors/app-error";
import { computePromoDiscount } from "@/features/promotion";
import { parseMoney } from "@/features/promotion";

export const promotionService = {
  async applyPromo(code: string, userId: string, bookingId: string, subtotal: string) {
    const promo = await promotionRepository.findByCode(code);
    if (!promo) throw new ValidationError("Kode promo tidak valid");

    if (promo.usageLimit !== null && promo.usageLimit !== undefined && (promo.usageCount ?? 0) >= promo.usageLimit) {
      throw new ConflictError("Kuota promo habis");
    }

    const sub = parseMoney(subtotal);
    const discount = computePromoDiscount(promo, sub);

    await promotionRepository.incrementUsage(promo.id);
    await promotionRepository.recordUsage(promo.id, userId, bookingId);

    return { discount, total: sub - discount };
  },
};
