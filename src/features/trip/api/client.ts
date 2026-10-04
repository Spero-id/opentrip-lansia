import { toDetail } from "@/features/trip/trip-mapper";
import { toPublicError } from "@/lib/errors/to-public-error";
import type { TripDetail, TripReview } from "@/features/trip/types";

function toTripDetail(raw: unknown): TripDetail {
  return toDetail(raw as Record<string, unknown>) as unknown as TripDetail;
}

export async function fetchTrips(): Promise<TripDetail[]> {
  try {
    const res = await fetch("/api/trips");
    const data: unknown = await res.json();
    if (!Array.isArray(data) || data.length === 0) return [];
    return data
      .filter((d) => (d as { status?: string }).status === "published")
      .map((d) => toTripDetail(d));
  } catch {
    return [];
  }
}

export async function fetchTripById(id: string): Promise<TripDetail | null> {
  const trips = await fetchTrips();
  return trips.find((d) => d.id === id) ?? null;
}

export async function fetchTripReviews(tripId: string): Promise<TripReview[]> {
  try {
    const res = await fetch(`/api/reviews?tripId=${encodeURIComponent(tripId)}&status=approved`);
    const data: unknown = await res.json();
    return Array.isArray(data) ? (data as TripReview[]) : [];
  } catch {
    return [];
  }
}

export function getTripImages(dest: TripDetail): string[] {
  if (Array.isArray(dest.images) && dest.images.length > 0) {
    return dest.images.filter((v): v is string => typeof v === "string" && v.length > 0);
  }
  if (typeof dest.image === "string" && dest.image.length > 0) return [dest.image];
  return [];
}

export function getPublicErrorMessage(err: unknown): string {
  return toPublicError(err);
}
