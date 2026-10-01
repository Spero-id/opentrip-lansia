import { describe, expect, it } from "vitest";
import {
  buildTripPayload,
  formatTripPrice,
  mapTripFacilities,
  mapTripItinerary,
  nextItineraryDay,
  parseTripPrice,
  validateTripForm,
} from "@/features/admin/trip-form";
import type { TripFormState } from "@/features/admin/trip-form";

function makeForm(partial: Partial<TripFormState> = {}): TripFormState {
  return {
    type: "open_trip",
    title: "Bromo",
    slug: "bromo",
    description: "",
    durationDays: 2,
    status: "draft",
    isFeatured: false,
    categoryId: "cat-1",
    location: "Malang",
    province: "Jawa Timur",
    geoPoint: "",
    isSeniorFriendly: true,
    accessibilityInfo: "",
    image: "",
    price: 500000,
    meetingPoint: "Stasiun Malang",
    meetingPointTime: "08.00",
    ...partial,
  };
}

describe("validateTripForm", () => {
  it("passes valid form", () => {
    expect(validateTripForm(makeForm())).toEqual({});
  });

  it("flags each missing field", () => {
    const errors = validateTripForm(
      makeForm({ title: "", slug: "", durationDays: 0, categoryId: "", location: "", province: "", price: 0, meetingPoint: "", meetingPointTime: "" }),
    );
    expect(Object.keys(errors).sort()).toEqual(
      ["title", "slug", "durationDays", "categoryId", "location", "province", "price", "meetingPoint", "meetingPointTime"].sort(),
    );
  });
});

describe("formatTripPrice / parseTripPrice", () => {
  it("formats with Rp prefix", () => {
    expect(formatTripPrice(1500000)).toBe("Rp 1.500.000");
    expect(formatTripPrice("")).toBe("");
    expect(formatTripPrice(0)).toBe("");
  });

  it("parses digits only", () => {
    expect(parseTripPrice("Rp 1.500.000")).toBe(1500000);
    expect(parseTripPrice("")).toBe(0);
  });
});

describe("mapTripItinerary / mapTripFacilities", () => {
  it("normalizes day variants", () => {
    expect(mapTripItinerary([{ day: 2, title: "X" }])).toEqual([
      { dayNumber: 2, location: "", title: "X", description: "" },
    ]);
    expect(mapTripItinerary([])).toEqual([]);
    expect(mapTripItinerary(null)).toEqual([]);
  });

  it("normalizes string and object facilities", () => {
    expect(mapTripFacilities(["Makan", { name: "Bus", icon: "Bus" }])).toEqual([
      { name: "Makan", icon: "" },
      { name: "Bus", icon: "Bus" },
    ]);
  });

  it("computes next day", () => {
    expect(nextItineraryDay([])).toBe(1);
    expect(nextItineraryDay([{ dayNumber: 3, location: "", title: "", description: "" }])).toBe(4);
  });
});

describe("buildTripPayload", () => {
  it("builds dual itinerary shapes and meeting point", () => {
    const payload = buildTripPayload(
      makeForm(),
      ["img1.jpg"],
      [{ dayNumber: 1, location: "Bromo", title: "", description: "Naik" }],
      [{ name: "Makan", icon: "" }, { name: "  ", icon: "X" }],
    ) as { itinerary: unknown[]; itineraryItems: Array<{ title: string }>; facilities: unknown[]; meetingPointsJson: unknown[]; image: string };
    expect(payload.itinerary).toHaveLength(1);
    expect(payload.itineraryItems[0].title).toBe("Hari 1");
    expect(payload.facilities).toHaveLength(1);
    expect(payload.meetingPointsJson).toHaveLength(1);
    expect(payload.image).toBe("img1.jpg");
  });
});
