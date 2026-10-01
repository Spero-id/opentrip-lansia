import { describe, expect, it } from "vitest";
import { parsePreferences } from "@/features/my-trips";

describe("parsePreferences", () => {
  it("returns empty for blank input", () => {
    expect(parsePreferences("")).toEqual([]);
    expect(parsePreferences("   \n  ")).toEqual([]);
  });
  it("returns empty when there are no sections", () => {
    expect(parsePreferences("Hanya teks biasa tanpa kurung")).toEqual([]);
  });
  it("parses one section with rows", () => {
    expect(parsePreferences("[Jadwal]\nHari: Senin\nJam: 08:00")).toEqual([
      { title: "Jadwal", rows: [{ key: "Hari", value: "Senin" }, { key: "Jam", value: "08:00" }] },
    ]);
  });
  it("parses multiple sections", () => {
    const sections = parsePreferences("[A]\nK: V\n[B]\nX: Y");
    expect(sections.map((s) => s.title)).toEqual(["A", "B"]);
    expect(sections[1].rows).toEqual([{ key: "X", value: "Y" }]);
  });
  it("skips blank and colon-less lines", () => {
    const sections = parsePreferences("[A]\n\nno-colon here\nK: V\n");
    expect(sections).toEqual([{ title: "A", rows: [{ key: "K", value: "V" }] }]);
  });
  it("trims keys and values", () => {
    const sections = parsePreferences("[A]\n  Kunci  :  Nilai  ");
    expect(sections[0].rows).toEqual([{ key: "Kunci", value: "Nilai" }]);
  });
});
