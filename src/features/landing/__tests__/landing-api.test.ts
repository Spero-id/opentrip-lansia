import { describe, expect, it, vi, afterEach } from "vitest";
import { clampLandingPage, fetchLandingTrips, toLandingCard } from "@/features/landing/api/client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("toLandingCard", () => {
  it("maps trip fields with fallbacks", () => {
    const card = toLandingCard({ id: "1", name: "Bromo" });
    expect(card).toMatchObject({
      id: "1",
      title: "Bromo",
      location: "Indonesia",
      category: "Alam",
      isSeniorFriendly: true,
      rating: null,
      priceMin: 0,
    });
  });

  it("prefers image then first of images", () => {
    expect(toLandingCard({ id: "a", image: "x.jpg" }).image).toBe("x.jpg");
    expect(toLandingCard({ id: "b", images: ["y.jpg"] }).image).toBe("y.jpg");
    expect(toLandingCard({ id: "c" }).image).toBeNull();
  });
});

describe("clampLandingPage", () => {
  it("clamps within range", () => {
    expect(clampLandingPage(-1, 3)).toBe(0);
    expect(clampLandingPage(5, 3)).toBe(2);
    expect(clampLandingPage(1, 3)).toBe(1);
  });
});

describe("fetchLandingTrips", () => {
  it("maps array payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: () => Promise.resolve([{ id: "1", title: "Bromo" }]) }),
    );
    const trips = await fetchLandingTrips();
    expect(trips).toHaveLength(1);
    expect(trips[0].title).toBe("Bromo");
  });

  it("returns empty list on failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    await expect(fetchLandingTrips()).resolves.toEqual([]);
  });
});
