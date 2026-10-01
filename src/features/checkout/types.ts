export type CheckoutStep = "details" | "payment" | "confirmation";

export interface MeetingPoint {
  time?: string | null;
  location?: string | null;
  description?: string | null;
}

export interface DestinationSummary {
  id?: string | null;
  image: string;
  title: string;
  category?: string | null;
  location?: string | null;
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

export interface DbVoucher {
  code: string;
  title?: string | null;
  value: string | number;
  type: string;
  minPurchase?: unknown;
  maxDiscount?: string | number | null;
  usageLimit?: number | null;
  usageCount?: number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  isActive?: boolean | null;
}

export interface BookingSnapshot {
  orderId: string;
  destination: DestinationSummary | null;
  pax: number;
  customer: Customer;
  voucherCode: string | null;
  appliedVoucher: AppliedVoucher | null;
  referralCode: string | null;
  paymentMethod: string | null;
  proofUrl: string;
  subtotal: number;
  totalAmount: number;
}

export interface CheckoutState {
  step: CheckoutStep;
  destination: DestinationSummary | null;
  pax: number;
  customer: Customer;
  voucherCode: string;
  appliedVoucher: AppliedVoucher | null;
  voucherError: string;
  referralCode: string;
  appliedReferral: AppliedReferral | null;
  referralError: string;
  paymentMethod: string | null;
  proofUrl: string;
  orderId: string;
  totalAmount: number;
  isLoading: boolean;
  error: string | null;
  agreeToTerms: boolean;
  bookingId: string | null;
}

export type CheckoutAction =
  | { type: "SET_DESTINATION"; destination: DestinationSummary | null }
  | { type: "SET_PAX"; pax: number }
  | { type: "SET_CUSTOMER"; field: string; value: unknown }
  | { type: "AUTOFILL_PROFILE" }
  | { type: "SET_VOUCHER_CODE"; code: string }
  | { type: "APPLY_VOUCHER"; vouchers: DbVoucher[]; loading: boolean; locked: boolean }
  | { type: "REMOVE_VOUCHER" }
  | { type: "SET_REFERRAL_CODE"; code: string }
  | { type: "APPLY_REFERRAL_STARTED" }
  | { type: "APPLY_REFERRAL_SUCCESS"; code: string; referrerName: string | null; referrerId: string | null }
  | { type: "APPLY_REFERRAL_FAILURE"; message: string }
  | { type: "REMOVE_REFERRAL" }
  | { type: "SET_PAYMENT_METHOD"; method: string | null }
  | { type: "SET_PROOF_URL"; url: string }
  | { type: "SET_AGREE"; value: boolean }
  | { type: "SET_STEP"; step: CheckoutStep }
  | { type: "GO_BACK" }
  | { type: "SET_ERROR"; message: string }
  | { type: "ORDER_STARTED"; orderId: string }
  | { type: "ORDER_CONFIRMED"; bookingId: string | null }
  | { type: "ORDER_FAILED"; message: string }
  | { type: "PAYMENT_STARTED" }
  | { type: "PAYMENT_BLOCKED" }
  | { type: "PAYMENT_CONFIRMED" }
  | { type: "PAYMENT_FAILED"; message: string }
  | { type: "RESET" };

export interface AppliedVoucher {
  code: string;
  label: string;
  discount: number;
  type: string;
  value: number;
  percentageValue: number;
  maxDiscount: number;
}

export interface AppliedReferral {
  code: string;
  referrerName?: string | null;
  referrerId?: string | null;
}

export type TermsModalType = "terms" | "privacy";
