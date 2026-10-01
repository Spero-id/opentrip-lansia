import { describe, expect, it } from "vitest";
import { parseMoney, parsePromoValue } from "@/features/promotion/promo-value";
import { computePromoDiscount } from "@/features/promotion/promo-discount";
import { resolveVoucher } from "@/features/checkout/hooks/use-checkout";

const percentagePromo = {
  code: "AEZAKMI",
  title: "Promo murah meriah 70%",
  type: "percentage",
  value: "70%",
  minPurchase: "100000",
  maxDiscount: "100000",
  usageLimit: 30,
  usageCount: 0,
  isActive: true,
};

const SUBTOTAL = 2200000;

describe("parsePromoValue / parseMoney", () => {
  it("reads percentages with or without the % sign", () => {
    expect(parsePromoValue("70%", "percentage")).toBe(70);
    expect(parsePromoValue("70", "percentage")).toBe(70);
    expect(parsePromoValue("7.5%", "percentage")).toBe(7.5);
    expect(parsePromoValue("20 %", "percentage")).toBe(20);
  });

  it("reads nominal values including Indonesian thousand separators", () => {
    expect(parsePromoValue("100000", "nominal")).toBe(100000);
    expect(parsePromoValue("100.000", "nominal")).toBe(100000);
    expect(parsePromoValue("Rp100.000", "nominal")).toBe(100000);
  });

  it("returns 0 for unparseable input instead of NaN", () => {
    expect(parsePromoValue("abc", "percentage")).toBe(0);
    expect(parsePromoValue("", "nominal")).toBe(0);
    expect(parsePromoValue(null, "percentage")).toBe(0);
    expect(parseMoney("")).toBe(0);
  });
});

describe("client and server compute identical totals", () => {
  it("percentage promo with max discount: client total === server total", () => {
    const applied = resolveVoucher("AEZAKMI", [percentagePromo as never], SUBTOTAL);
    expect(applied.voucherError).toBe("");
    expect(applied.appliedVoucher).not.toBeNull();

    const clientDiscount = computePromoDiscount(
      {
        type: applied.appliedVoucher!.type,
        value: applied.appliedVoucher!.value,
        maxDiscount: applied.appliedVoucher!.maxDiscount,
      },
      SUBTOTAL
    );
    const clientTotal = SUBTOTAL - clientDiscount;

    const serverDiscount = computePromoDiscount(percentagePromo, SUBTOTAL);
    const serverTotal = SUBTOTAL - serverDiscount;

    expect(clientDiscount).toBe(100000);
    expect(serverDiscount).toBe(100000);
    expect(clientTotal).toBe(2100000);
    expect(clientTotal).toBe(serverTotal);
  });

  it("unknown or unapplied codes are rejected with no discount", () => {
    const applied = resolveVoucher("TIDAKADA", [percentagePromo as never], SUBTOTAL);
    expect(applied.appliedVoucher).toBeNull();
    expect(applied.voucherError).toBe("Kode voucher tidak valid.");
  });

  it("enforces the minimum purchase amount", () => {
    const applied = resolveVoucher("AEZAKMI", [percentagePromo as never], 50000);
    expect(applied.appliedVoucher).toBeNull();
    expect(applied.voucherError).toContain("Minimal order");
  });
});
