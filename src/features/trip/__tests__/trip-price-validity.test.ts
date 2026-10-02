import { describe, expect, it } from "vitest";
import { isPriceValid, pickValidPrice } from "@/features/trip/trip.repository";

describe("isPriceValid", () => {
  it("accepts open tiers", () => {
    expect(isPriceValid({ name: "Dewasa", price: "100" }, "2026-10-02")).toBe(true);
  });

  it("rejects future and expired tiers", () => {
    expect(isPriceValid({ name: "X", price: "1", validFrom: "2026-11-01" }, "2026-10-02")).toBe(false);
    expect(isPriceValid({ name: "X", price: "1", validUntil: "2026-09-01" }, "2026-10-02")).toBe(false);
    expect(isPriceValid({ name: "X", price: "1", validFrom: "2026-10-01", validUntil: "2026-10-31" }, "2026-10-02")).toBe(true);
  });
});

describe("pickValidPrice", () => {
  it("prefers Dewasa among valid tiers", () => {
    const tiers = [
      { name: "Anak", price: "50" },
      { name: "Dewasa", price: "100" },
    ];
    expect(pickValidPrice(tiers, "2026-10-02")).toBe("100");
  });

  it("skips expired Dewasa for valid Anak", () => {
    const tiers = [
      { name: "Dewasa", price: "100", validUntil: "2026-09-01" },
      { name: "Anak", price: "50" },
    ];
    expect(pickValidPrice(tiers, "2026-10-02")).toBe("50");
  });

  it("returns null when all expired", () => {
    expect(pickValidPrice([{ name: "Dewasa", price: "100", validUntil: "2026-09-01" }], "2026-10-02")).toBeNull();
  });
});
