import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAdminDashboard } from "@/features/admin/hooks/use-admin-dashboard";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useAdminDashboard", () => {
  it("loads stats and recent bookings", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            stats: { totalTrips: 7, bookingThisMonth: 3, bookingChange: 50, revenue: "Rp 1Jt", activePromos: 2 },
            recentBookings: [{ id: "b1" }],
          }),
      }),
    );
    const { result } = renderHook(() => useAdminDashboard());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats?.totalTrips).toBe(7);
    expect(result.current.recentBookings).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it("surfaces fetch error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const { result } = renderHook(() => useAdminDashboard());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toContain("500");
    expect(result.current.stats).toBeNull();
  });
});
