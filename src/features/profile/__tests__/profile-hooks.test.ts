import { describe, expect, it, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useProfileStats, useReferralHistory } from "@/features/profile";

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

describe("useProfileStats", () => {
  it("returns summary data after load", async () => {
    mockFetchOnce({ referralCode: "ABC123", loyaltyPoints: 150, stats: {} });
    const { result } = renderHook(() => useProfileStats());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data?.referralCode).toBe("ABC123");
    expect(result.current.error).toBeNull();
  });

  it("surfaces error message on failure", async () => {
    mockFetchOnce({ error: "Unauthorized" }, false, 401);
    const { result } = renderHook(() => useProfileStats());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(result.current.error).not.toBeNull();
  });
});

describe("useReferralHistory", () => {
  it("refetches when page changes", async () => {
    mockFetchOnce({ history: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 2 } });
    const { result, rerender } = renderHook(({ page }: { page: number }) => useReferralHistory(page), {
      initialProps: { page: 1 },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    mockFetchOnce({ history: [], pagination: { total: 0, page: 2, limit: 10, totalPages: 2 } });
    rerender({ page: 2 });
    await waitFor(() => expect(result.current.pagination?.page).toBe(2));
    expect(fetch).toHaveBeenCalledWith("/api/user/referral/history?page=2&limit=10");
  });
});
