import { describe, expect, it } from "vitest";
import { parseMoney, parsePromoValue } from "./promo-value";
import { computePromoDiscount } from "./promo-discount";
import { resolveVoucher } from "../../lib/hooks/useCheckout";

const aeZakmi = {
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
  it("membaca persentase dengan atau tanpa tanda %", () => {
    expect(parsePromoValue("70%", "percentage")).toBe(70);
    expect(parsePromoValue("70", "percentage")).toBe(70);
    expect(parsePromoValue("7.5%", "percentage")).toBe(7.5);
    expect(parsePromoValue("20 %", "percentage")).toBe(20);
  });

  it("membaca nominal termasuk format ribuan Indonesia", () => {
    expect(parsePromoValue("100000", "nominal")).toBe(100000);
    expect(parsePromoValue("100.000", "nominal")).toBe(100000);
    expect(parsePromoValue("Rp100.000", "nominal")).toBe(100000);
  });

  it("mengembalikan 0 untuk nilai yang tidak terbaca (bukan NaN)", () => {
    expect(parsePromoValue("abc", "percentage")).toBe(0);
    expect(parsePromoValue("", "nominal")).toBe(0);
    expect(parsePromoValue(null, "percentage")).toBe(0);
    expect(parseMoney("")).toBe(0);
  });
});

describe("klien dan server menghitung total identik", () => {
  it("promo persentase dengan max discount: total client === total server", () => {
    const applied = resolveVoucher("AEZAKMI", [aeZakmi as never], SUBTOTAL);
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

    const serverDiscount = computePromoDiscount(aeZakmi, SUBTOTAL);
    const serverTotal = SUBTOTAL - serverDiscount;

    expect(clientDiscount).toBe(100000);
    expect(serverDiscount).toBe(100000);
    expect(clientTotal).toBe(2100000);
    expect(clientTotal).toBe(serverTotal);
  });

  it("promo yang belum di-apply / kode asal tetap ditolak tanpa diskon", () => {
    const applied = resolveVoucher("TIDAKADA", [aeZakmi as never], SUBTOTAL);
    expect(applied.appliedVoucher).toBeNull();
    expect(applied.voucherError).toBe("Kode voucher tidak valid.");
  });

  it("menghormati minimal pembelian", () => {
    const applied = resolveVoucher("AEZAKMI", [aeZakmi as never], 50000);
    expect(applied.appliedVoucher).toBeNull();
    expect(applied.voucherError).toContain("Minimal order");
  });
});
