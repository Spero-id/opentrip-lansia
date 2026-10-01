import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchReferralHistory, fetchReferralSummary } from "@/features/profile";

function mockFetchOnce(payload: unknown, ok = true, status = 200) {
  const fn = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(payload),
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchReferralSummary", () => {
  it("returns parsed summary on success", async () => {
    const payload = {
      referralCode: "ABC123",
      loyaltyPoints: 150,
      stats: { totalReferred: 3, convertedReferred: 1, pendingReferred: 2, totalCommission: 50000 },
    };
    mockFetchOnce(payload);
    await expect(fetchReferralSummary()).resolves.toEqual(payload);
  });

  it("calls the summary endpoint", async () => {
    const fn = mockFetchOnce({});
    await fetchReferralSummary().catch(() => {});
    expect(fn).toHaveBeenCalledWith("/api/user/referral");
  });

  it("throws on non-ok response", async () => {
    mockFetchOnce({ error: "Unauthorized" }, false, 401);
    await expect(fetchReferralSummary()).rejects.toThrow("401");
  });

  it("throws on network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    await expect(fetchReferralSummary()).rejects.toThrow();
  });
});

describe("fetchReferralHistory", () => {
  it("requests page and limit as query params", async () => {
    const fn = mockFetchOnce({ history: [], pagination: { total: 0, page: 2, limit: 10, totalPages: 0 } });
    await fetchReferralHistory(2);
    expect(fn).toHaveBeenCalledWith("/api/user/referral/history?page=2&limit=10");
  });

  it("returns history and pagination", async () => {
    const payload = {
      history: [{ id: "1", status: "pending", createdAt: "2026-01-01" }],
      pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };
    mockFetchOnce(payload);
    await expect(fetchReferralHistory(1)).resolves.toEqual(payload);
  });

  it("throws on non-ok response", async () => {
    mockFetchOnce({ error: "Unauthorized" }, false, 401);
    await expect(fetchReferralHistory(1)).rejects.toThrow("401");
  });
});
