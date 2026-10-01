import { describe, expect, it, vi, afterEach } from "vitest";
import { fetchTripReviews, fetchTrips, getTripImages } from "@/features/trip/api/client";
import type { TripDetail } from "@/features/trip/types";

afterEach(() => {
  vi.unstubAllGlobals();
});

function makeTrip(partial: Partial<TripDetail> & { id: string }): TripDetail {
  return {
    title: "Trip",
    image: null,
    images: [],
    location: "Indonesia",
    category: "Alam",
    isSeniorFriendly: true,
    rating: null,
    reviewCount: 0,
    priceMin: 100000,
    description: "",
    itinerary: [],
    ...partial,
  };
}

describe("fetchTrips", () => {
  it("keeps only published trips", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve([
          { id: "1", name: "Open", status: "published", price: 100000 },
          { id: "2", name: "Draft", status: "draft", price: 200000 },
        ]),
    }));
    const trips = await fetchTrips();
    expect(trips.map((t) => t.id)).toEqual(["1"]);
  });

  it("returns empty list on fetch failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    await expect(fetchTrips()).resolves.toEqual([]);
  });

  it("returns empty list for non-array payload", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: () => Promise.resolve({ error: "boom" }) }));
    await expect(fetchTrips()).resolves.toEqual([]);
  });
});

describe("fetchTripReviews", () => {
  it("returns array payload", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve([{ id: "r1", rating: 5 }]),
    }));
    await expect(fetchTripReviews("t1")).resolves.toEqual([{ id: "r1", rating: 5 }]);
  });

  it("returns empty list on failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    await expect(fetchTripReviews("t1")).resolves.toEqual([]);
  });
});

describe("getTripImages", () => {
  it("prefers images array", () => {
    const trip = makeTrip({ id: "x", images: ["a.jpg", "b.jpg"], image: "c.jpg" });
    expect(getTripImages(trip)).toEqual(["a.jpg", "b.jpg"]);
  });

  it("falls back to single image", () => {
    const trip = makeTrip({ id: "x", images: [], image: "only.jpg" });
    expect(getTripImages(trip)).toEqual(["only.jpg"]);
  });

  it("returns empty list without images", () => {
    expect(getTripImages(makeTrip({ id: "x" }))).toEqual([]);
  });
});
