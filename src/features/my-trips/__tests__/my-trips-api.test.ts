import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildTripImages,
  fetchGalleryMedia,
  fetchMyBookings,
  fetchPrivateRequests,
  fetchTrips,
  normalizeList,
  submitReview,
} from "@/features/my-trips";

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

describe("fetchMyBookings", () => {
  it("returns payload on success", async () => {
    mockFetchOnce([{ id: "b1" }]);
    await expect(fetchMyBookings()).resolves.toEqual([{ id: "b1" }]);
  });
  it("throws on non-ok response", async () => {
    mockFetchOnce({}, false, 500);
    await expect(fetchMyBookings()).rejects.toThrow("500");
  });
});

describe("fetchPrivateRequests", () => {
  it("returns payload on success", async () => {
    mockFetchOnce([{ id: "r1" }]);
    await expect(fetchPrivateRequests()).resolves.toEqual([{ id: "r1" }]);
  });
  it("throws on non-ok response", async () => {
    mockFetchOnce({}, false, 500);
    await expect(fetchPrivateRequests()).rejects.toThrow("500");
  });
});

describe("fetchTrips", () => {
  it("returns payload on success", async () => {
    mockFetchOnce([{ id: "t1" }]);
    await expect(fetchTrips()).resolves.toEqual([{ id: "t1" }]);
  });
});

describe("normalizeList", () => {
  it("passes arrays through", () => {
    expect(normalizeList([{ id: "a" }])).toEqual([{ id: "a" }]);
  });
  it("unwraps rows objects", () => {
    expect(normalizeList({ rows: [{ id: "a" }] })).toEqual([{ id: "a" }]);
  });
  it("returns empty for anything else", () => {
    expect(normalizeList(null)).toEqual([]);
    expect(normalizeList({})).toEqual([]);
    expect(normalizeList("x")).toEqual([]);
  });
});

describe("buildTripImages", () => {
  it("maps trip ids to images preferring image over images[0]", () => {
    expect(
      buildTripImages([
        { id: "t1", image: "a.jpg" },
        { id: "t2", images: ["b.jpg"] },
        { id: "t3" },
        { image: "noid.jpg" },
      ]),
    ).toEqual({ t1: "a.jpg", t2: "b.jpg" });
  });
  it("returns empty for non-arrays", () => {
    expect(buildTripImages(null)).toEqual({});
  });
});

describe("fetchGalleryMedia", () => {
  it("requests the group gallery and returns media", async () => {
    const fn = mockFetchOnce({ media: [{ id: "m1", url: "u" }] });
    await expect(fetchGalleryMedia("t1", "d1")).resolves.toEqual([{ id: "m1", url: "u" }]);
    expect(fn).toHaveBeenCalledWith("/api/trips/t1/groups/d1/gallery");
  });
  it("returns empty when media is missing", async () => {
    mockFetchOnce({});
    await expect(fetchGalleryMedia("t1", "d1")).resolves.toEqual([]);
  });
  it("throws on non-ok response", async () => {
    mockFetchOnce({}, false, 500);
    await expect(fetchGalleryMedia("t1", "d1")).rejects.toThrow("500");
  });
});

describe("submitReview", () => {
  const input = { bookingId: "b1", tripId: "t1", rating: 5, content: "Bagus" };
  it("posts the review payload", async () => {
    const fn = mockFetchOnce({ ok: true });
    await expect(submitReview(input)).resolves.toBeUndefined();
    expect(fn).toHaveBeenCalledWith(
      "/api/reviews",
      expect.objectContaining({ method: "POST" }),
    );
  });
  it("throws the server message on rejection", async () => {
    mockFetchOnce({ error: "duplikat" }, false, 400);
    await expect(submitReview(input)).rejects.toThrow("duplikat");
  });
  it("throws the network message on failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    await expect(submitReview(input)).rejects.toThrow("jaringan");
  });
});
