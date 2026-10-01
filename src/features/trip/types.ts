export interface TripImage {
  url: string;
}

export interface TripItineraryItem {
  day: number | string;
  title: string;
  description?: string | null;
}

export interface TripMeetingPoint {
  name?: string;
  address?: string;
}

export interface TripReviewItem {
  author: string;
  date?: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export interface TripActiveGroup {
  id?: string;
  startDate?: string | null;
  endDate?: string | null;
  quotaBooked?: number | null;
  maxParticipants?: number | null;
}

export interface TripDetail {
  id: string;
  title: string;
  name?: string;
  image: string | null;
  images: string[];
  location: string;
  category: string;
  categoryName?: string;
  isSeniorFriendly: boolean;
  rating: number | null;
  reviewCount: number;
  price?: number | string | null;
  priceMin: number;
  priceMax?: number | null;
  departureId?: string | null;
  departure_id?: string | null;
  description: string;
  accessibilityInfo?: string;
  highlights?: Array<string | { name: string; icon?: string }>;
  facilities?: Array<string | { name: string; icon?: string }>;
  itinerary: TripItineraryItem[];
  meetingPoints?: TripMeetingPoint[];
  meetingPointsJson?: TripMeetingPoint[];
  reviewsList?: TripReviewItem[];
  bookedCount?: number | null;
  activeGroup?: TripActiveGroup | null;
  status?: string;
}

export type TripFilterCategories = string[];

export interface TripFilterState {
  search: string;
  selectedLocation: string;
  priceMin: string | number;
  priceMax: string | number;
  selectedCategories: string[];
  isSeniorFriendlyOnly: boolean;
}

export type TripTabId = "tentang" | "itinerary" | "aksesibilitas" | "ulasan";

export interface TripReview {
  id: string;
  userName?: string | null;
  rating: number;
  content?: string | null;
  createdAt?: string | null;
  isVerifiedPurchase?: boolean | null;
}
