import { OrderDomain } from "@/lib/order";
import { computePromoDiscount } from "@/features/promotion/promo-discount";
import { parseMoney, parsePromoValue } from "@/features/promotion/promo-value";
import type {
  AppliedVoucher,
  CheckoutState,
  DbVoucher,
} from "./types";

export function resolveVoucher(
  rawCode: unknown,
  vouchers: DbVoucher[],
  subtotal: number,
): { appliedVoucher: AppliedVoucher | null; voucherError: string } {
  const code = String(rawCode ?? "").trim().toUpperCase();
  if (!code) {
    return { appliedVoucher: null, voucherError: "Masukkan kode voucher." };
  }

  const found = vouchers.find((v) => v.code?.trim().toUpperCase() === code);
  if (!found) {
    return { appliedVoucher: null, voucherError: "Kode voucher tidak valid." };
  }

  const minPurchase = parseMoney(found.minPurchase);
  if (minPurchase > 0 && subtotal < minPurchase) {
    return {
      appliedVoucher: null,
      voucherError: `Minimal order ${OrderDomain.formatPrice(minPurchase)} untuk voucher ini.`,
    };
  }

  if ((found.usageLimit ?? 0) > 0 && (found.usageCount ?? 0) >= (found.usageLimit ?? 0)) {
    return { appliedVoucher: null, voucherError: "Voucher sudah mencapai batas pemakaian." };
  }

  const now = new Date();
  if (found.validFrom && new Date(found.validFrom) > now) {
    return { appliedVoucher: null, voucherError: "Voucher belum aktif." };
  }
  if (found.validUntil && new Date(found.validUntil) < now) {
    return { appliedVoucher: null, voucherError: "Voucher sudah kedaluwarsa." };
  }

  const value = parsePromoValue(found.value, found.type);
  const maxDiscount = parseMoney(found.maxDiscount);
  const discount = computePromoDiscount(found, subtotal);

  return {
    appliedVoucher: {
      code: found.code ?? code,
      label: found.title || found.code || code,
      discount,
      type: found.type,
      value,
      percentageValue: found.type === "percentage" ? value : 0,
      maxDiscount,
    },
    voucherError: "",
  };
}

export function getTicketSubtotal(s: CheckoutState): number {
  return (s.destination?.priceMin ?? 0) * s.pax;
}

export function getDiscount(s: CheckoutState): number {
  if (!s.appliedVoucher) return 0;
  const subtotal = getTicketSubtotal(s);
  const av = s.appliedVoucher;
  return computePromoDiscount(
    { type: av.type, value: av.value, maxDiscount: av.maxDiscount },
    subtotal,
  );
}

export function getTotal(s: CheckoutState): number {
  return Math.max(0, getTicketSubtotal(s) - getDiscount(s));
}
