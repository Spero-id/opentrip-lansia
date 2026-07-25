import { slugify, generateCode, formatCurrency, parseAmount } from "@/shared/utils/helpers";

describe("slugify", () => {
  it("converts text to lowercase slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces special characters with hyphens", () => {
    expect(slugify("Trip ke Bali!")).toBe("trip-ke-bali");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});

describe("generateCode", () => {
  it("generates code with given prefix", () => {
    const code = generateCode("OTL");
    expect(code).toMatch(/^OTL-[A-Z0-9]{6}$/);
  });

  it("generates unique codes", () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateCode("TST")));
    expect(codes.size).toBe(100);
  });
});

describe("formatCurrency", () => {
  it("formats number as IDR currency", () => {
    const result = formatCurrency("1500000");
    expect(result).toContain("1.500.000");
  });

  it("handles zero", () => {
    const result = formatCurrency("0");
    expect(result).toContain("0");
  });
});

describe("parseAmount", () => {
  it("parses string to number", () => {
    expect(parseAmount("1500000")).toBe(1500000);
  });

  it("returns 0 for invalid input", () => {
    expect(parseAmount("abc")).toBe(0);
  });

  it("returns 0 for empty string", () => {
    expect(parseAmount("")).toBe(0);
  });
});
