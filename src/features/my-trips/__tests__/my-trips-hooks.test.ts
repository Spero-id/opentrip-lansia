import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useGalleryModal, useOpenTripBooking } from "@/features/my-trips";

function mockFetchOnce(payload: unknown, ok = true, status = 200) {
  const fn = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(payload),
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

function mockFetchSequence(payloads: unknown[]) {
  const fns = payloads.map((p) =>
    vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(p) }),
  );
  vi.stubGlobal("fetch", vi.fn().mockImplementation((url: string) => {
    if (url.includes("/api/trips") && !url.includes("/gallery")) return fns[1]();
    return fns[0]();
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useOpenTripBooking", () => {
  it("loads bookings and trip images", async () => {
    mockFetchSequence([[{ id: "b1" }], [{ id: "t1", image: "a.jpg" }]]);
    const { result } = renderHook(() => useOpenTripBooking());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.bookings).toEqual([{ id: "b1" }]);
    expect(result.current.tripImages).toEqual({ t1: "a.jpg" });
    expect(result.current.error).toBeNull();
  });
  it("normalizes rows payloads", async () => {
    mockFetchSequence([{ rows: [{ id: "b1" }] }, { rows: [] }]);
    const { result } = renderHook(() => useOpenTripBooking());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.bookings).toEqual([{ id: "b1" }]);
  });
  it("surfaces error message on failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    const { result } = renderHook(() => useOpenTripBooking());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.bookings).toEqual([]);
    expect(result.current.error).not.toBeNull();
  });
  it("refresh reloads data", async () => {
    const fn = mockFetchOnce([{ id: "b1" }]);
    const { result } = renderHook(() => useOpenTripBooking());
    await waitFor(() => expect(result.current.loading).toBe(false));
    mockFetchOnce([{ id: "b2" }]);
    await result.current.refresh();
    expect(fn).toHaveBeenCalled();
    await waitFor(() => expect(result.current.bookings).toEqual([{ id: "b2" }]));
  });
});

describe("useGalleryModal", () => {
  it("loads media when open with ids", async () => {
    mockFetchOnce({ media: [{ id: "m1", url: "u" }] });
    const { result } = renderHook(() => useGalleryModal("t1", "d1", true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.media).toEqual([{ id: "m1", url: "u" }]);
  });
  it("skips fetch when closed", async () => {
    const fn = mockFetchOnce({ media: [] });
    renderHook(() => useGalleryModal("t1", "d1", false));
    await new Promise((r) => setTimeout(r, 50));
    expect(fn).not.toHaveBeenCalled();
  });
  it("empties media on failure", async () => {
    mockFetchOnce({}, false, 500);
    const { result } = renderHook(() => useGalleryModal("t1", "d1", true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.media).toEqual([]);
  });
});
