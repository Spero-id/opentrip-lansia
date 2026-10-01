import { describe, expect, it } from "vitest";
import { buildGroupPayload, mapGroupToForm, validateGroupForm } from "@/features/admin/group-form";

describe("validateGroupForm", () => {
  it("passes valid form", () => {
    expect(
      validateGroupForm({ startDate: "2026-11-01", endDate: "2026-11-03", maxParticipants: 10, minParticipants: 1, notes: "" }),
    ).toEqual({});
  });

  it("flags missing dates and quota", () => {
    const errors = validateGroupForm({ startDate: "", endDate: "", maxParticipants: 0, minParticipants: 1, notes: "" });
    expect(Object.keys(errors).sort()).toEqual(["startDate", "endDate", "maxParticipants"].sort());
  });

  it("rejects end before start", () => {
    const errors = validateGroupForm({ startDate: "2026-11-03", endDate: "2026-11-01", maxParticipants: 10, minParticipants: 1, notes: "" });
    expect(errors.endDate).toContain("setelah tanggal berangkat");
  });
});

describe("buildGroupPayload / mapGroupToForm", () => {
  it("nulls empty notes", () => {
    expect(buildGroupPayload({ startDate: "a", endDate: "b", maxParticipants: 5, minParticipants: 1, notes: "" })).toMatchObject({
      notes: null,
    });
  });

  it("maps group with defaults", () => {
    expect(mapGroupToForm({})).toEqual({ startDate: "", endDate: "", maxParticipants: 10, minParticipants: 1, notes: "" });
    expect(mapGroupToForm({ startDate: "2026-11-01T00:00:00Z", maxParticipants: 8 }).startDate).toBe("2026-11-01");
  });
});
