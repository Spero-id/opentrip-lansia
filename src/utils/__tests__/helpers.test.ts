// @vitest-environment node
import { describe, expect, it } from "vitest";
import { generateCode, slugify } from "@/utils/helpers";

describe("slugify", () => {
  it("menurunkan huruf dan mengganti spasi dengan tanda hubung", () => {
    expect(slugify("Trip Gunung Bromo")).toBe("trip-gunung-bromo");
  });

  it("mengganti spasi beruntun dengan satu tanda hubung", () => {
    expect(slugify("Trip    Bromo")).toBe("trip-bromo");
    expect(slugify("a--b")).toBe("a-b");
  });

  it("memangkas tanda hubung di awal dan akhir", () => {
    expect(slugify("  Bromo  ")).toBe("bromo");
    expect(slugify("---Bromo---")).toBe("bromo");
  });

  it("mengganti underscore dan simbol menjadi pemisah", () => {
    expect(slugify("trip_bromo")).toBe("trip-bromo");
    expect(slugify("Promo 20% Off")).toBe("promo-20-off");
    expect(slugify("Bromo & Ijen")).toBe("bromo-ijen");
  });

  it("mengganti huruf non-Latin dengan tanda hubung", () => {
    expect(slugify("Trip Ünïcode")).toBe("trip-n-code");
  });

  it("menghasilkan string kosong untuk input tanpa karakter valid", () => {
    expect(slugify("!!!")).toBe("");
    expect(slugify("")).toBe("");
  });

  it("tidak menghasilkan tanda hubung ganda maupun di tepi", () => {
    for (const input of ["Trip  Bromo!!", "--Trip--", "a_b_c", "  spaced  out  "]) {
      const result = slugify(input);
      expect(result).not.toMatch(/--/);
      expect(result).not.toMatch(/^-|-$/);
    }
  });
});

describe("generateCode", () => {
  it("memakai prefix dan 6 karakter", () => {
    expect(generateCode("OTL")).toMatch(/^OTL-[A-Z0-9]{6}$/);
  });

  it("hanya memakai karakter dari alfabet yang ditentukan", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateCode("OTL")).toMatch(/^OTL-[ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789]{6}$/);
    }
  });

  it("tidak mengulang kode pada 500 pemanggilan", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 500; i++) codes.add(generateCode("OTL"));
    expect(codes.size).toBe(500);
  });

  it("menggunakan crypto, bukan Math.random", () => {
    const original = Math.random;
    Math.random = () => {
      throw new Error("Math.random should not be used");
    };
    try {
      expect(generateCode("OTL")).toMatch(/^OTL-[A-Z0-9]{6}$/);
    } finally {
      Math.random = original;
    }
  });
});