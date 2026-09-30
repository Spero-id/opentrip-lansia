import { parseMoney, parsePromoValue } from "./promo-value";

/**
 * Satu-satunya tempat diskon promo dihitung.
 *
 * Dipakai oleh:
 *  - client  : src/lib/hooks/useCheckout.js (PriceBreakdown + payload /api/checkout)
 *  - server  : src/app/api/checkout/route.ts (authoritative)
 *  - service : src/modules/promotion/promotion.service.ts
 *
 * Dulu ketiganya memakai rumus & parser berbeda (Number / toNumber / parseInt),
 * sehingga total yang dikirim UI bisa beda dengan total yang diharapkan server
 * -> 400 "Total pembayaran tidak sesuai."
 */
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
