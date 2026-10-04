import { describe, expect, it } from "vitest";
import { formatIDR, formatIDRCompact, formatNumber } from "@/utils/format";

describe("formatIDR", () => {
  it("memisahkan ribuan dengan titik", () => {
    expect(formatIDR(350000)).toBe("Rp 350.000");
    expect(formatIDR(0)).toBe("Rp 0");
    expect(formatIDR(1000)).toBe("Rp 1.000");
  });

  it("membulatkan ke bawah seperti implementasi lama", () => {
    expect(formatIDR(350000.99)).toBe("Rp 350.000");
  });

  it("menerima string angka dari database", () => {
    expect(formatIDR("1250000")).toBe("Rp 1.250.000");
  });

  it("mengembalikan null untuk input kosong", () => {
    expect(formatIDR(null)).toBeNull();
    expect(formatIDR(undefined)).toBeNull();
    expect(formatIDR("")).toBeNull();
  });

  it("mengembalikan input apa adanya bila sudah terformat", () => {
    expect(formatIDR("Rp 350.000")).toBe("Rp 350.000");
    expect(formatIDR("350.000")).toBe("350.000");
    expect(formatIDR("n/a")).toBe("n/a");
  });

  it("tidak salah baca pemisah ribuan sebagai desimal", () => {
    expect(formatIDR("1.250.000")).toBe("1.250.000");
    expect(formatIDR("1.750")).toBe("1.750");
  });
});

describe("formatIDRCompact", () => {
  it("memakai satuan ringkas untuk nilai besar", () => {
    expect(formatIDRCompact(2_500_000_000)).toBe("Rp 2.5M");
    expect(formatIDRCompact(1_750_000)).toBe("Rp 1.8Jt");
  });

  it("memakai format penuh di bawah satu juta", () => {
    expect(formatIDRCompact(350000)).toBe("Rp 350.000");
  });
});

describe("formatNumber", () => {
  it("memisahkan ribuan tanpa awalan mata uang", () => {
    expect(formatNumber(1234567)).toBe("1.234.567");
    expect(formatNumber("1234567")).toBe("1.234.567");
  });
});