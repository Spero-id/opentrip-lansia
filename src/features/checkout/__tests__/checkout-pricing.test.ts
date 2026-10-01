import { describe, expect, it } from "vitest";
import { getDiscount, getTicketSubtotal, getTotal, resolveVoucher } from "@/features/checkout";
import { initialCheckoutState } from "@/features/checkout";
import type { CheckoutState, DbVoucher } from "@/features/checkout";

const FIXED: DbVoucher = {
  code: "HEMAT10",
  title: "Hemat 10rb",
  value: 10000,
  type: "fixed",
  minPurchase: 0,
  maxDiscount: 0,
  usageLimit: null,
  usageCount: 0,
  validFrom: null,
  validUntil: null,
  isActive: true,
};

const PERCENT: DbVoucher = {
  code: "PERSEN20",
  title: "Diskon 20%",
  value: 20,
  type: "percentage",
  minPurchase: 0,
  maxDiscount: 50000,
  usageLimit: null,
  usageCount: 0,
  validFrom: null,
  validUntil: null,
  isActive: true,
};

function subtotalState(priceMin: number, pax = 1): CheckoutState {
  return {
    ...initialCheckoutState,
    destination: { id: "d1", image: "", title: "Trip", priceMin },
    pax,
  };
}

describe("resolveVoucher", () => {
  it("rejects empty codes", () => {
    const { appliedVoucher, voucherError } = resolveVoucher("   ", [FIXED], 100000);
    expect(appliedVoucher).toBeNull();
    expect(voucherError).toBe("Masukkan kode voucher.");
  });
  it("rejects unknown codes", () => {
    const { appliedVoucher, voucherError } = resolveVoucher("TIDAKADA", [FIXED], 100000);
    expect(appliedVoucher).toBeNull();
    expect(voucherError).toBe("Kode voucher tidak valid.");
  });
  it("enforces minimum purchase", () => {
    const { appliedVoucher, voucherError } = resolveVoucher("HEMAT10", [
      { ...FIXED, minPurchase: 500000 },
    ], 100000);
    expect(appliedVoucher).toBeNull();
    expect(voucherError).toMatch("Minimal order");
  });
  it("enforces usage limit", () => {
    const { appliedVoucher, voucherError } = resolveVoucher("HEMAT10", [
      { ...FIXED, usageLimit: 5, usageCount: 5 },
    ], 100000);
    expect(appliedVoucher).toBeNull();
    expect(voucherError).toMatch("batas pemakaian");
  });
  it("rejects not-yet-valid vouchers", () => {
    const { appliedVoucher, voucherError } = resolveVoucher("HEMAT10", [
      { ...FIXED, validFrom: "2099-01-01" },
    ], 100000);
    expect(appliedVoucher).toBeNull();
    expect(voucherError).toBe("Voucher belum aktif.");
  });
  it("rejects expired vouchers", () => {
    const { appliedVoucher, voucherError } = resolveVoucher("HEMAT10", [
      { ...FIXED, validUntil: "2020-01-01" },
    ], 100000);
    expect(appliedVoucher).toBeNull();
    expect(voucherError).toBe("Voucher sudah kedaluwarsa.");
  });
  it("applies fixed vouchers", () => {
    const { appliedVoucher, voucherError } = resolveVoucher("HEMAT10", [FIXED], 100000);
    expect(voucherError).toBe("");
    expect(appliedVoucher?.code).toBe("HEMAT10");
    expect(appliedVoucher?.discount).toBe(10000);
  });
  it("caps percentage vouchers at max discount", () => {
    const { appliedVoucher } = resolveVoucher("PERSEN20", [PERCENT], 2200000);
    expect(appliedVoucher?.discount).toBe(50000);
    expect(appliedVoucher?.percentageValue).toBe(20);
  });
});

describe("selectors", () => {
  it("computes ticket subtotal from price and pax", () => {
    expect(getTicketSubtotal(subtotalState(100000, 2))).toBe(200000);
  });
  it("returns zero subtotal without destination", () => {
    expect(getTicketSubtotal(initialCheckoutState)).toBe(0);
  });
  it("returns zero discount without voucher", () => {
    expect(getDiscount(subtotalState(100000))).toBe(0);
  });
  it("floors total at zero", () => {
    const s: CheckoutState = {
      ...subtotalState(10000),
      appliedVoucher: {
        code: "X", label: "X", discount: 99999, type: "fixed", value: 99999,
        percentageValue: 0, maxDiscount: 99999,
      },
    };
    expect(getTotal(s)).toBe(0);
  });
});
