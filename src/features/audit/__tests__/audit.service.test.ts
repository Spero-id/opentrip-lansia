vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
  },
}));

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { db } from "@/lib/db";
import { auditService, diffFields, isSensitiveKey, pickFields } from "@/features/audit";

const mockedInsert = db.insert as Mock;

function insertReturning(rows: unknown[]) {
  const returning = vi.fn(() => Promise.resolve(rows));
  return { values: vi.fn(() => ({ returning })) };
}

function lastInsertedValues(mock: Mock) {
  const chain = mock.mock.results[0]?.value as { values: Mock };
  return chain.values.mock.calls[0][0];
}

describe("diffFields", () => {
  it("keeps only allowlisted fields that changed", () => {
    const out = diffFields(
      { name: "Dewasa", price: "350000", quota: 10 },
      { name: "Dewasa", price: "375000", quota: 10 },
      ["name", "price", "quota"],
    );
    expect(out).toEqual({ price: "375000" });
  });

  it("returns empty object when nothing changed", () => {
    const out = diffFields({ price: 100 }, { price: 100 }, ["price"]);
    expect(out).toEqual({});
  });

  it("ignores fields outside the allowlist", () => {
    const out = diffFields({}, { secretNote: "x", price: 1 }, ["price"]);
    expect(out).toEqual({ price: 1 });
  });

  it("treats null and undefined as equal so clearing is only recorded once", () => {
    expect(diffFields({ validUntil: null }, { validUntil: undefined }, ["validUntil"])).toEqual({});
    expect(diffFields({ validUntil: "2026-01-01" }, { validUntil: null }, ["validUntil"])).toEqual({
      validUntil: null,
    });
  });

  it("compares Date and object values structurally", () => {
    const d1 = new Date("2026-01-01T00:00:00.000Z");
    const d2 = new Date("2026-01-01T00:00:00.000Z");
    expect(diffFields({ at: d1 }, { at: d2 }, ["at"])).toEqual({});
    expect(diffFields({ meta: { a: 1 } }, { meta: { a: 1 } }, ["meta"])).toEqual({});
  });

  it("redacts sensitive allowlisted fields instead of recording them", () => {
    const out = diffFields({ password: "old" }, { password: "new" }, ["password"]);
    expect(out).toEqual({ password: "[redacted]" });
  });

  it("returns empty object when there is no new snapshot", () => {
    expect(diffFields({ price: 1 }, null, ["price"])).toEqual({});
  });
});

describe("pickFields", () => {
  it("picks allowlisted fields and fills missing with null", () => {
    expect(pickFields({ name: "Anak", quota: 5 }, ["name", "price", "quota"])).toEqual({
      name: "Anak",
      price: null,
      quota: 5,
    });
  });

  it("returns empty object for missing source", () => {
    expect(pickFields(null, ["name"])).toEqual({});
  });

  it("redacts sensitive fields", () => {
    expect(pickFields({ apiKey: "abc" }, ["apiKey"])).toEqual({ apiKey: "[redacted]" });
  });
});

describe("isSensitiveKey", () => {
  it("matches normalized key variants", () => {
    expect(isSensitiveKey("password")).toBe(true);
    expect(isSensitiveKey("newPassword")).toBe(true);
    expect(isSensitiveKey("api_key")).toBe(true);
    expect(isSensitiveKey("AccessToken")).toBe(true);
    expect(isSensitiveKey("price")).toBe(false);
    expect(isSensitiveKey("name")).toBe(false);
  });
});

describe("auditService.record", () => {
  beforeEach(() => vi.clearAllMocks());

  it("writes a row with the given entity", async () => {
    mockedInsert.mockReturnValue(insertReturning([{ id: "log-1" }]));
    const id = await auditService.record({
      adminId: "admin-1",
      action: "update",
      entityType: "trip_price",
      entityId: "11111111-2222-4333-8444-555555555555",
      oldValues: { price: "350000" },
      newValues: { price: "375000" },
      description: "Tier diubah",
    });
    expect(id).toBe("log-1");
    const values = lastInsertedValues(mockedInsert);
    expect(values).toMatchObject({
      adminId: "admin-1",
      action: "update",
      entityType: "trip_price",
      entityId: "11111111-2222-4333-8444-555555555555",
      description: "Tier diubah",
    });
  });

  it("stores null admin and entity id when actor is unknown", async () => {
    mockedInsert.mockReturnValue(insertReturning([{ id: "log-2" }]));
    await auditService.record({ action: "delete", entityType: "site_settings", description: "kunci diubah" });
    const values = lastInsertedValues(mockedInsert);
    expect(values.adminId).toBeNull();
    expect(values.entityId).toBeNull();
  });

  it("redacts sensitive keys before persisting", async () => {
    mockedInsert.mockReturnValue(insertReturning([{ id: "log-3" }]));
    await auditService.record({
      action: "update",
      entityType: "user",
      newValues: { role: "admin", password: "rahasia" },
    });
    const values = lastInsertedValues(mockedInsert);
    expect(values.newValues).toEqual({ role: "admin", password: "[redacted]" });
  });

  it("never throws when the insert fails so the business write survives", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockedInsert.mockImplementation(() => {
      throw new Error("db down");
    });
    await expect(
      auditService.record({ action: "create", entityType: "payment" }),
    ).resolves.toBeNull();
    spy.mockRestore();
  });
});
describe("auditService.record entity id normalization", () => {
  beforeEach(() => vi.clearAllMocks());

  it("stores uuid entity ids as entity_id", async () => {
    mockedInsert.mockReturnValue(insertReturning([{ id: "log-4" }]));
    await auditService.record({
      action: "update",
      entityType: "payment",
      entityId: "ea005367-3891-4104-bb56-a6e201d5f90e",
    });
    const values = lastInsertedValues(mockedInsert);
    expect(values.entityId).toBe("ea005367-3891-4104-bb56-a6e201d5f90e");
    expect(values.newValues).toBeNull();
  });

  it("parks non-uuid keys in newValues.entityRef instead of failing the insert", async () => {
    mockedInsert.mockReturnValue(insertReturning([{ id: "log-5" }]));
    await auditService.record({
      action: "update",
      entityType: "user",
      entityId: "ICklVF3Y3xlIFMzGTBRKafZdQIWcEs8A",
      newValues: { phone: "081200011122" },
    });
    const values = lastInsertedValues(mockedInsert);
    expect(values.entityId).toBeNull();
    expect(values.newValues).toEqual({ phone: "081200011122", entityRef: "ICklVF3Y3xlIFMzGTBRKafZdQIWcEs8A" });
  });

  it("still creates newValues for a non-uuid key when there is no snapshot", async () => {
    mockedInsert.mockReturnValue(insertReturning([{ id: "log-6" }]));
    await auditService.record({ action: "delete", entityType: "user", entityId: "abc123" });
    expect(lastInsertedValues(mockedInsert).newValues).toEqual({ entityRef: "abc123" });
  });
});
