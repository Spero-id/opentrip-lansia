// @vitest-environment node
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { db } from "@/lib/db";
import { authService } from "@/features/auth";

const mockedSelect = db.select as Mock;
const mockedInsert = db.insert as Mock;
const mockedUpdate = db.update as Mock;
const mockedDelete = db.delete as Mock;

/** db.select().from().where().limit() returning queued row sets. */
function queueSelectRows(queues: Record<string, unknown>[][]) {
  let call = 0;
  mockedSelect.mockImplementation(() => ({
    from: vi.fn(() => {
      const rows = queues[call] ?? [];
      call += 1;
      const where = vi.fn(() => ({ limit: vi.fn(() => Promise.resolve(rows)) }));
      return { where };
    }),
  }));
}

function queueInsert() {
  mockedInsert.mockImplementation(() => ({
    values: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: "log-1" }])) })),
  }));
}

function lastInsertedValues(): Record<string, unknown> {
  const chain = mockedInsert.mock.results[0]?.value as { values: Mock };
  return chain.values.mock.calls[0][0];
}

function userRow(partial: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    name: "Budi",
    email: "budi@otl.id",
    role: "user",
    phone: null,
    emailVerified: true,
    ...partial,
  };
}

describe("authService.updateUser audit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queueInsert();
    mockedUpdate.mockImplementation(() => ({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })) }));
  });

  it("records one audit row with the changed fields only", async () => {
    queueSelectRows([[userRow()], [userRow({ role: "admin" })]]);

    await authService.updateUser("user-1", { role: "admin" }, "admin-9");

    expect(mockedUpdate).toHaveBeenCalledTimes(1);
    expect(mockedInsert).toHaveBeenCalledTimes(1);
    const values = lastInsertedValues();
    expect(values).toMatchObject({
      adminId: "admin-9",
      action: "update",
      entityType: "user",
    });
    expect(values.entityId).toBeNull();
    expect(values.newValues).toEqual({ role: "admin", entityRef: "user-1" });
  });

  it("never logs the email address", async () => {
    queueSelectRows([[userRow()], [userRow({ name: "Budi Santoso" })]]);

    await authService.updateUser("user-1", { name: "Budi Santoso" }, "admin-9");

    const values = lastInsertedValues();
    expect(values.oldValues).not.toHaveProperty("email");
    expect(values.newValues).not.toHaveProperty("email");
  });

  it("skips the audit row when nothing actually changed", async () => {
    queueSelectRows([[userRow()], [userRow()]]);

    await authService.updateUser("user-1", { name: "Budi" }, "admin-9");

    expect(mockedUpdate).toHaveBeenCalledTimes(1);
    expect(mockedInsert).not.toHaveBeenCalled();
  });

  it("still writes the row with null admin when the actor is unknown", async () => {
    queueSelectRows([[userRow()], [userRow({ emailVerified: false })]]);

    await authService.updateUser("user-1", { emailVerified: false });

    expect(mockedInsert).toHaveBeenCalledTimes(1);
    expect(lastInsertedValues().adminId).toBeNull();
  });

  it("writes the user first, then the audit row", async () => {
    const order: string[] = [];
    queueSelectRows([[userRow()], [userRow({ role: "admin" })]]);
    mockedUpdate.mockImplementation(() => {
      order.push("update");
      return { set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })) };
    });
    mockedInsert.mockImplementation(() => {
      order.push("audit");
      return { values: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: "log-1" }])) })) };
    });

    await authService.updateUser("user-1", { role: "admin" }, "admin-9");

    expect(order).toEqual(["update", "audit"]);
  });
});

describe("authService.deleteUser audit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queueInsert();
    mockedDelete.mockImplementation(() => ({ where: vi.fn(() => Promise.resolve()) }));
  });

  it("snapshots the user before deletion", async () => {
    queueSelectRows([[userRow({ role: "admin" })]]);

    await authService.deleteUser("user-1", "admin-9");

    expect(mockedDelete).toHaveBeenCalledTimes(1);
    const values = lastInsertedValues();
    expect(values).toMatchObject({ action: "delete", entityType: "user", entityId: null });
    expect((values.newValues as Record<string, unknown>).entityRef).toBe("user-1");
    expect(values.oldValues).toMatchObject({ name: "Budi", role: "admin" });
    expect(values.oldValues).not.toHaveProperty("entityRef");
  });

  it("still records when the user row is already gone", async () => {
    queueSelectRows([[]]);

    await authService.deleteUser("user-1", null);

    expect(mockedInsert).toHaveBeenCalledTimes(1);
    expect(lastInsertedValues().oldValues).toEqual({});
  });
});