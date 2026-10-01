import { describe, expect, it } from "vitest";
import { filterTrips, hasActiveTripFilters, INITIAL_TRIP_FILTERS } from "@/features/trip/hooks/use-trip-filter";
import type { TripDetail } from "@/features/trip/types";

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

const TRIPS: TripDetail[] = [
  makeTrip({ id: "a", title: "Bromo Sunrise", location: "Malang, Jawa Timur", category: "Gunung", priceMin: 500000, isSeniorFriendly: true }),
  makeTrip({ id: "b", title: "Pantai Kuta", location: "Bali", category: "Pantai", priceMin: 300000, isSeniorFriendly: false }),
  makeTrip({ id: "c", title: "Borobudur Heritage", location: "Magelang, Jawa Tengah", category: "Budaya", priceMin: 1500000, isSeniorFriendly: true }),
];

describe("filterTrips", () => {
  it("returns all trips when filters are empty", () => {
    expect(filterTrips(TRIPS, INITIAL_TRIP_FILTERS)).toHaveLength(3);
  });

  it("matches search against title, location, and category", () => {
    expect(filterTrips(TRIPS, { ...INITIAL_TRIP_FILTERS, search: "bromo" }).map((t) => t.id)).toEqual(["a"]);
    expect(filterTrips(TRIPS, { ...INITIAL_TRIP_FILTERS, search: "bali" }).map((t) => t.id)).toEqual(["b"]);
    expect(filterTrips(TRIPS, { ...INITIAL_TRIP_FILTERS, search: "budaya" }).map((t) => t.id)).toEqual(["c"]);
  });

  it("filters by exact location", () => {
    const result = filterTrips(TRIPS, { ...INITIAL_TRIP_FILTERS, selectedLocation: "Bali" });
    expect(result.map((t) => t.id)).toEqual(["b"]);
  });

  it("filters by price range on priceMin", () => {
    const min = filterTrips(TRIPS, { ...INITIAL_TRIP_FILTERS, priceMin: 400000 });
    expect(min.map((t) => t.id)).toEqual(["a", "c"]);
    const max = filterTrips(TRIPS, { ...INITIAL_TRIP_FILTERS, priceMax: 400000 });
    expect(max.map((t) => t.id)).toEqual(["b"]);
  });

  it("filters by category case-insensitively", () => {
    const result = filterTrips(TRIPS, { ...INITIAL_TRIP_FILTERS, selectedCategories: ["pantai"] });
    expect(result.map((t) => t.id)).toEqual(["b"]);
  });

  it("filters senior-friendly only", () => {
    const result = filterTrips(TRIPS, { ...INITIAL_TRIP_FILTERS, isSeniorFriendlyOnly: true });
    expect(result.map((t) => t.id)).toEqual(["a", "c"]);
  });
});

describe("hasActiveTripFilters", () => {
  it("is false for initial filters", () => {
    expect(hasActiveTripFilters(INITIAL_TRIP_FILTERS)).toBe(false);
  });

  it("is true when any filter is set", () => {
    expect(hasActiveTripFilters({ ...INITIAL_TRIP_FILTERS, search: "x" })).toBe(false);
    expect(hasActiveTripFilters({ ...INITIAL_TRIP_FILTERS, selectedLocation: "Bali" })).toBe(true);
    expect(hasActiveTripFilters({ ...INITIAL_TRIP_FILTERS, priceMin: 100 })).toBe(true);
    expect(hasActiveTripFilters({ ...INITIAL_TRIP_FILTERS, selectedCategories: ["Alam"] })).toBe(true);
    expect(hasActiveTripFilters({ ...INITIAL_TRIP_FILTERS, isSeniorFriendlyOnly: true })).toBe(true);
  });
});
