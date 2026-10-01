import type { TripDetail } from "@/features/trip/types";

export const LANDING_PAGE_SIZE = 6;

interface RawLandingTrip {
  id: string;
  title?: string;
  name?: string;
  image?: string | null;
  images?: string[] | null;
  location?: string | null;
  rating?: number | null;
  priceMin?: number | null;
  categoryName?: string | null;
  category?: string | null;
  isSeniorFriendly?: boolean;
}

export function toLandingCard(trip: RawLandingTrip): TripDetail {
  const image =
    trip.image || (Array.isArray(trip.images) && trip.images[0]) || null;
  return {
    id: trip.id,
    title: trip.title || trip.name || "",
    image,
    images: image ? [image] : [],
    location: trip.location || "Indonesia",
    category: trip.categoryName || trip.category || "Alam",
    isSeniorFriendly: trip.isSeniorFriendly !== undefined ? trip.isSeniorFriendly : true,
    rating: trip.rating ?? null,
    reviewCount: 0,
    priceMin: trip.priceMin || 0,
    description: "",
    itinerary: [],
  };
}

export async function fetchLandingTrips(): Promise<TripDetail[]> {
  try {
    const res = await fetch("/api/trips?featured=true");
    const data: unknown = await res.json();
    return Array.isArray(data) ? (data as RawLandingTrip[]).map(toLandingCard) : [];
  } catch {
    return [];
  }
}

export function clampLandingPage(page: number, count: number): number {
  return Math.min(Math.max(page, 0), Math.max(count - 1, 0));
}
