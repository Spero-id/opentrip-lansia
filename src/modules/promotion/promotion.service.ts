import { promotionRepository } from "./promotion.repository";

export const promotionService = {
  async applyPromo(code: string, userId: string, bookingId: string, subtotal: string) {
    const promo = await promotionRepository.findByCode(code);
    if (!promo) throw new Error("Kode promo tidak valid");

    if (promo.usageLimit !== null && promo.usageLimit !== undefined && (promo.usageCount ?? 0) >= promo.usageLimit) {
      throw new Error("Kuota promo habis");
    }

    let discount = 0;
    const sub = parseInt(subtotal);
    if (promo.type === "percentage") {
      discount = Math.floor(sub * (parseInt(promo.value) / 100));
    } else {
      discount = parseInt(promo.value);
    }

    if (promo.maxDiscount) {
      discount = Math.min(discount, parseInt(promo.maxDiscount));
    }

    await promotionRepository.incrementUsage(promo.id);
    await promotionRepository.recordUsage(promo.id, userId, bookingId);

    return { discount, total: sub - discount };
  },
};
