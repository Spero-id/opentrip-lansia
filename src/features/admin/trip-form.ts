export interface TripItineraryInput {
  dayNumber: number;
  location: string;
  title: string;
  description: string;
}

export interface TripFacilityInput {
  name: string;
  icon: string;
}

export interface TripFormState {
  type: string;
  title: string;
  slug: string;
  description: string;
  durationDays: number;
  status: string;
  isFeatured: boolean;
  categoryId: string;
  location: string;
  province: string;
  geoPoint: string;
  isSeniorFriendly: boolean;
  accessibilityInfo: string;
  image: string;
  price: number;
  meetingPoint: string;
  meetingPointTime: string;
}

export const EMPTY_TRIP_ITINERARY: TripItineraryInput = { dayNumber: 1, location: "", title: "", description: "" };
export const EMPTY_TRIP_FACILITY: TripFacilityInput = { name: "", icon: "Check" };
export const DEFAULT_MEETING_TIME = "08.00";

export function formatTripPrice(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === "" || val === 0) return "";
  const raw = String(val).replace(/\D/g, "");
  if (!raw) return "";
  return "Rp " + parseInt(raw, 10).toLocaleString("id-ID");
}

export function parseTripPrice(val: string): number {
  const raw = val.replace(/\D/g, "");
  return raw ? parseInt(raw, 10) : 0;
}

export function validateTripForm(form: TripFormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (!form.title.trim()) e.title = "Judul trip wajib diisi.";
  if (!form.slug.trim()) e.slug = "Slug wajib diisi.";
  if (!form.durationDays || form.durationDays < 1) e.durationDays = "Durasi minimal 1 hari.";
  if (!form.categoryId) e.categoryId = "Pilih atau buat kategori terlebih dahulu.";
  if (!form.location.trim()) e.location = "Lokasi utama wajib diisi.";
  if (!form.province) e.province = "Pilih provinsi.";
  if (!form.price || form.price <= 0) e.price = "Harga wajib diisi dan harus lebih dari 0.";
  if (!form.meetingPoint.trim()) e.meetingPoint = "Lokasi kumpul wajib diisi.";
  if (!form.meetingPointTime) e.meetingPointTime = "Jam kumpul wajib diisi.";
  return e;
}

interface RawItineraryItem {
  dayNumber?: number;
  day?: number;
  location?: string;
  title?: string;
  description?: string;
}

export function mapTripItinerary(raw: unknown): TripItineraryInput[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return (raw as RawItineraryItem[]).map((it) => ({
    dayNumber: it.dayNumber || it.day || 1,
    location: it.location || "",
    title: it.title || "",
    description: it.description || "",
  }));
}

export function mapTripFacilities(raw: unknown): TripFacilityInput[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return (raw as Array<string | { name?: string; icon?: string } | null>).map((f) =>
    typeof f === "string" ? { name: f, icon: "" } : { name: f?.name || "", icon: f?.icon || "" },
  );
}

export function nextItineraryDay(list: TripItineraryInput[]): number {
  return list.length > 0 ? list[list.length - 1].dayNumber + 1 : 1;
}

export function buildTripPayload(
  form: TripFormState,
  images: string[],
  itineraryList: TripItineraryInput[],
  facilitiesList: TripFacilityInput[],
): Record<string, unknown> {
  return {
    type: "open_trip",
    title: form.title,
    slug: form.slug || undefined,
    description: form.description || undefined,
    durationDays: Number(form.durationDays) || 1,
    status: form.status,
    isFeatured: form.isFeatured,
    categoryId: form.categoryId || undefined,
    location: form.location || undefined,
    province: form.province || undefined,
    geoPoint: form.geoPoint || undefined,
    isSeniorFriendly: form.isSeniorFriendly,
    accessibilityInfo: form.accessibilityInfo || undefined,
    image: images.length > 0 ? images[0] : undefined,
    images: images.length > 0 ? images : undefined,
    priceMin: form.price || undefined,
    priceMax: form.price || undefined,
    price: form.price || undefined,
    facilities: facilitiesList
      .filter((item) => item.name.trim() !== "")
      .map((item) => ({ name: item.name.trim(), icon: item.icon || "" })),
    itinerary: itineraryList.map((item) => ({
      day: Number(item.dayNumber) || 1,
      location: item.location,
      title: item.title,
      description: item.description,
    })),
    itineraryItems: itineraryList.map((item) => ({
      dayNumber: Number(item.dayNumber) || 1,
      location: item.location,
      title: item.title || `Hari ${item.dayNumber || 1}`,
      description: item.description,
    })),
    meetingPointsJson: form.meetingPoint.trim()
      ? [
          {
            time: form.meetingPointTime || DEFAULT_MEETING_TIME,
            location: form.meetingPoint.trim(),
            description: "Titik kumpul utama penjemputan. Silakan hadir 15 menit sebelum waktu tersebut.",
          },
        ]
      : [],
  };
}
