import { parseMoney, parsePromoValue } from "./promo-value";

export interface PromoLike {
  type: string;
  value: string | number;
  maxDiscount?: string | number | null;
}

export function computePromoDiscount(promo: PromoLike, subtotal: number): number {
  if (!Number.isFinite(subtotal) || subtotal <= 0) return 0;

  const value = parsePromoValue(promo.value, promo.type);
  let discount =
    promo.type === "percentage" ? Math.round((subtotal * value) / 100) : value;

  if (promo.type === "percentage") {
    const maxDiscount = parseMoney(promo.maxDiscount);
    if (maxDiscount > 0) discount = Math.min(discount, maxDiscount);
  }

  return Math.max(0, Math.min(discount, subtotal));
}
