import { describe, expect, it } from "vitest";
import { normalizePriceInput } from "@/features/trip/trip.service";

describe("normalizePriceInput", () => {
  it("normalizes digits and defaults", () => {
    expect(normalizePriceInput({ name: " Anak ", price: "Rp 750.000", quota: 10 })).toMatchObject({
      name: "Anak",
      price: "750000",
      quota: 10,
      isActive: true,
    });
  });

  it("rejects empty name, zero price, bad quota, inverted dates", () => {
    expect(() => normalizePriceInput({ name: "", price: "100", quota: 1 })).toThrow("Nama tier");
    expect(() => normalizePriceInput({ name: "X", price: "0", quota: 1 })).toThrow("Harga tier");
    expect(() => normalizePriceInput({ name: "X", price: "100", quota: 0 })).toThrow("Kuota");
    expect(() =>
      normalizePriceInput({ name: "X", price: "100", quota: 1, validFrom: "2026-11-01", validUntil: "2026-10-01" }),
    ).toThrow("setelah tanggal mulai");
  });
});
