import { toPublicError } from "@/lib/errors/to-public-error";
import type { GalleryMedia, MyTripBooking, PrivateTripRequest } from "../types";

export async function fetchMyBookings(): Promise<unknown> {
  const res = await fetch("/api/bookings");
  if (!res.ok) throw new Error(`Bookings request failed: ${res.status}`);
  return res.json();
}

export async function fetchPrivateRequests(): Promise<unknown> {
  const res = await fetch("/api/private-trips");
  if (!res.ok) throw new Error(`Requests request failed: ${res.status}`);
  return res.json();
}

export async function fetchTrips(): Promise<unknown> {
  const res = await fetch("/api/trips");
  if (!res.ok) throw new Error(`Trips request failed: ${res.status}`);
  return res.json();
}

export function normalizeList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && Array.isArray((payload as { rows?: unknown }).rows)) {
    return (payload as { rows: T[] }).rows;
  }
  return [];
}

export function buildTripImages(trips: unknown): Record<string, string> {
  const imageMap: Record<string, string> = {};
  for (const t of normalizeList<{ id?: unknown; image?: unknown; images?: unknown }>(trips)) {
    const id = typeof t?.id === "string" ? t.id : null;
    const image = typeof t?.image === "string" && t.image
      ? t.image
      : Array.isArray(t?.images) && typeof t.images[0] === "string"
        ? t.images[0]
        : null;
    if (id && image) imageMap[id] = image;
  }
  return imageMap;
}

export async function fetchGalleryMedia(
  tripId: string,
  departureId: string,
): Promise<GalleryMedia[]> {
  const res = await fetch(`/api/trips/${tripId}/groups/${departureId}/gallery`);
  if (!res.ok) throw new Error(`Gallery request failed: ${res.status}`);
  const data: unknown = await res.json();
  if (!data || typeof data !== "object" || !Array.isArray((data as { media?: unknown }).media)) {
    return [];
  }
  return (data as { media: GalleryMedia[] }).media;
}

export async function submitReview(input: {
  bookingId: string;
  tripId: string;
  rating: number;
  content: string;
}): Promise<void> {
  let res: Response;
  try {
    res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error("Terjadi kesalahan jaringan. Silakan coba lagi.");
  }
  if (!res.ok) {
    let message = "Gagal mengirim ulasan";
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {}
    throw new Error(message);
  }
}

export function loadErrorMessage(err: unknown): string {
  return toPublicError(err);
}

export type { GalleryMedia, MyTripBooking, PrivateTripRequest };
