vi.mock("@/features/audit/audit.service", () => ({
  auditService: { list: vi.fn() },
}));

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { Mock } from "vitest";
import { auditService } from "@/features/audit/audit.service";
import { auditController } from "@/features/audit/audit.controller";

const mockedList = auditService.list as Mock;

function req(query: string): NextRequest {
  return new NextRequest(`http://localhost/api/admin/audit-logs${query}`);
}

describe("auditController.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedList.mockResolvedValue([]);
  });

  it("passes the supported filters through", async () => {
    const res = await auditController.list(req("?entityType=user&action=update&limit=25"));

    expect(res.status).toBe(200);
    expect(mockedList).toHaveBeenCalledWith({
      entityType: "user",
      entityId: null,
      adminId: null,
      action: "update",
      from: null,
      to: null,
      limit: 25,
    });
  });

  it("defaults the limit and caps it at 200", async () => {
    await auditController.list(req(""));
    expect(mockedList.mock.calls[0][0].limit).toBe(50);

    mockedList.mockClear();
    await auditController.list(req("?limit=9999"));
    expect(mockedList.mock.calls[0][0].limit).toBe(200);
  });

  it("falls back to the default limit for junk input", async () => {
    await auditController.list(req("?limit=abc"));
    expect(mockedList.mock.calls[0][0].limit).toBe(50);
  });

  it("accepts a date range and entity id", async () => {
    await auditController.list(
      req("?entityId=11111111-2222-4333-8444-555555555555&from=2026-10-01&to=2026-10-31")
    );
    expect(mockedList.mock.calls[0][0]).toMatchObject({
      entityId: "11111111-2222-4333-8444-555555555555",
      from: "2026-10-01",
      to: "2026-10-31",
    });
  });

  it("returns a public error message when the query fails", async () => {
    mockedList.mockRejectedValue(new Error("db down"));
    const res = await auditController.list(req(""));
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toHaveProperty("error");
  });
});