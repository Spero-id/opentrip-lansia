export interface BookingNotes {
  destinationId?: string | null;
  destinationName?: string | null;
  travelDate?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  specialRequest?: string | null;
  adminMessage?: string | null;
  tripId?: string | null;
  raw?: unknown;
}

export interface BookingPayment {
  status?: string | null;
  method?: string | null;
  proofUrl?: string | null;
  gatewayResponse?: { proofUrl?: string | null } | null;
  adminNote?: string | null;
}

export interface BookingParticipant {
  id?: string | number | null;
  fullName?: string | null;
  phone?: string | null;
  isPrimary?: boolean | null;
}

export interface MyTripBooking {
  id: string;
  bookingCode?: string | null;
  status?: string | null;
  totalParticipants?: number | string | null;
  totalAmount?: number | string | null;
  subtotal?: number | string | null;
  discountAmount?: number | string | null;
  notes?: string | BookingNotes | null;
  payments?: BookingPayment[] | null;
  participants?: BookingParticipant[] | null;
  hasReview?: boolean | null;
  departureId?: string | null;
  tripId?: string | null;
}

export interface GalleryMedia {
  id: string | number;
  url?: string | null;
}

export interface PrivateProposal {
  id: string;
  status: string;
  estimatedPrice?: number | string | null;
  proposalContent?: string | null;
  inclusions?: string | null;
  exclusions?: string | null;
}

export interface PrivateTripRequest {
  id: string;
  title?: string | null;
  durationDays?: number | string | null;
  participantsCount?: number | string | null;
  budgetEstimate?: number | string | null;
  status: string;
  destinationPreferences?: string | null;
  specialRequirements?: string | null;
  createdAt: string | Date;
  proposals?: PrivateProposal[] | null;
}
