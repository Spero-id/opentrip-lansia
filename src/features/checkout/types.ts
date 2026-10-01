export type CheckoutStep = "details" | "payment";

export interface MeetingPoint {
  time?: string | null;
  location?: string | null;
  description?: string | null;
}

export interface DestinationSummary {
  image: string;
  title: string;
  category: string;
  location: string;
  priceMin: number;
  meetingPoints?: MeetingPoint[] | null;
}

export interface Participant {
  id: string | number;
  fullName: string;
  birthDate: string;
  gender: string;
  phone: string;
  email: string;
  relationship: string;
}

export interface Customer {
  fullName?: string | null;
  birthDate?: string | null;
  phone?: string | null;
  address?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  healthConditions?: Record<string, boolean> | null;
  medications?: string | null;
  mobilityOption?: string | null;
}

export interface AppliedVoucher {
  code: string;
  label: string;
}

export interface AppliedReferral {
  code: string;
  referrerName?: string | null;
}

export type TermsModalType = "terms" | "privacy";
