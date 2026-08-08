export type UUID = string;

export type Currency = "IDR" | "USD";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "expired" | "refunded" | "rejected";

export type TripStatus = "draft" | "published" | "cancelled" | "completed";

export type TripType = "open_trip" | "private_trip";

export type UserRole = "user" | "agent" | "admin";

export type ReviewStatus = "pending" | "approved" | "rejected";
