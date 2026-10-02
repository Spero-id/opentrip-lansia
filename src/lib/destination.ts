export interface RawTripData {
  id?: unknown;
  name?: unknown;
  title?: unknown;
  image?: unknown;
  images?: unknown;
  location?: unknown;
  category?: unknown;
  categoryName?: unknown;
  isSeniorFriendly?: unknown;
  rating?: unknown;
  reviewCount?: unknown;
  price?: unknown;
  priceMin?: unknown;
  priceMax?: unknown;
  departureId?: unknown;
  departure_id?: unknown;
  description?: unknown;
  accessibilityInfo?: unknown;
  highlights?: unknown;
  facilities?: unknown;
  itinerary?: unknown;
  meetingPoints?: unknown;
  meetingPointsJson?: unknown;
  reviewsList?: unknown;
  bookedCount?: unknown;
  activeGroup?: unknown;
}

export interface TripDetailData {
  id: string;
  title: string;
  image: string | null;
  images: string[];
  location: string;
  category: string;
  isSeniorFriendly: boolean;
  rating: number | null;
  reviewCount: number;
  priceMin: number;
  priceMax: number;
  departureId: string | null;
  description: string;
  accessibilityInfo: string;
  highlights: string[];
  facilities: string[];
  itinerary: Array<{ day?: number; title?: string; description?: string; location?: string }>;
  meetingPoints: Array<{ name?: string; address?: string }>;
  reviewsList: unknown[];
  bookedCount: number | null;
  activeGroup: unknown | null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function firstString(...values: unknown[]): string | null {
  for (const v of values) {
    if (typeof v === "string" && v) return v;
  }
  return null;
}

export const DestinationDomain = {
  calculateTotalPrice(destination: { priceMin: number }, pax: number): number {
    if (pax <= 0) return 0;
    return pax * destination.priceMin;
  },

  isPopular(destination: { rating: number; reviewCount: number }): boolean {
    return destination.rating >= 4.7 && destination.reviewCount >= 2000;
  },

  getShortLocation(destination: { location?: string | null }): string {
    return destination.location ? destination.location.split(",")[0].trim() : "Indonesia";
  },
};

export const DEFAULT_RATING = 5.0;

export function toDetail(dest: RawTripData): TripDetailData {
  const rawImages = asStringArray(dest.images);
  const images = rawImages.length > 0 ? rawImages : firstString(dest.image) ? [firstString(dest.image) as string] : [];

  return {
    id: String(dest.id ?? ""),
    title: firstString(dest.name, dest.title) ?? "",
    image: firstString(dest.image, images[0] ?? null),
    images,
    location: asString(dest.location, "Indonesia"),
    category: firstString(dest.category, dest.categoryName) ?? "Alam",
    isSeniorFriendly: dest.isSeniorFriendly !== undefined ? Boolean(dest.isSeniorFriendly) : true,
    rating: typeof dest.rating === "number" ? dest.rating : null,
    reviewCount: typeof dest.reviewCount === "number" ? dest.reviewCount : 0,
    priceMin: Number(dest.price ?? dest.priceMin) || 0,
    priceMax: Number(dest.priceMax) || 0,
    departureId: firstString(dest.departureId, dest.departure_id),
    description: asString(dest.description, "Belum ada deskripsi."),
    accessibilityInfo: asString(dest.accessibilityInfo),
    highlights: asStringArray(dest.highlights),
    facilities: Array.isArray(dest.facilities) ? (dest.facilities as string[]) : [],
    itinerary: Array.isArray(dest.itinerary) ? dest.itinerary : [],
    meetingPoints: Array.isArray(dest.meetingPoints)
      ? dest.meetingPoints
      : Array.isArray(dest.meetingPointsJson)
        ? dest.meetingPointsJson
        : [],
    reviewsList: Array.isArray(dest.reviewsList) ? dest.reviewsList : [],
    bookedCount: typeof dest.bookedCount === "number" ? dest.bookedCount : null,
    activeGroup: dest.activeGroup ?? null,
  };
}
