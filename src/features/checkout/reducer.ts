import { getTicketSubtotal, resolveVoucher } from "./pricing";
import type { CheckoutAction, CheckoutState, Customer } from "./types";

export const initialCustomer: Customer = {
  fullName: "",
  birthDate: "",
  phone: "",
  address: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  healthConditions: {
    hypertension: false,
    diabetes: false,
    heart: false,
    asthma: false,
    vertigo: false,
    jointBone: false,
    none: false,
  },
  medications: "",
  mobilityOption: "independent",
};

const AUTOFILL_CUSTOMER: Customer = {
  fullName: "Budi Santoso",
  birthDate: "1955-03-15",
  phone: "081234567890",
  address: "Jl. Sudirman No. 123, Jakarta Selatan",
  emergencyContactName: "Rina Santoso",
  emergencyContactPhone: "081987654321",
  healthConditions: {
    hypertension: true,
    diabetes: false,
    heart: false,
    asthma: false,
    vertigo: false,
    jointBone: false,
    none: false,
  },
  medications: "Amlodipine 5mg",
  mobilityOption: "independent",
};

export const MIN_PAX = 1;
export const MAX_PAX = 10;

export const initialCheckoutState: CheckoutState = {
  step: "details",
  destination: null,
  pax: 1,
  customer: { ...initialCustomer },
  voucherCode: "",
  appliedVoucher: null,
  voucherError: "",
  referralCode: "",
  appliedReferral: null,
  referralError: "",
  paymentMethod: "BCA",
  proofUrl: "",
  orderId: "",
  totalAmount: 0,
  isLoading: false,
  error: null,
  agreeToTerms: false,
  bookingId: null,
};

export function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case "SET_DESTINATION":
      return { ...state, destination: action.destination };
    case "SET_PAX":
      return { ...state, pax: Math.max(MIN_PAX, Math.min(action.pax, MAX_PAX)) };
    case "SET_CUSTOMER":
      return { ...state, customer: { ...state.customer, [action.field]: action.value } as Customer };
    case "AUTOFILL_PROFILE":
      return { ...state, customer: { ...AUTOFILL_CUSTOMER } };
    case "SET_VOUCHER_CODE":
      return { ...state, voucherCode: action.code, voucherError: "" };
    case "APPLY_VOUCHER": {
      if (action.loading) {
        return { ...state, voucherError: "Memuat data voucher, silakan coba lagi sebentar." };
      }
      if (action.vouchers.length === 0) {
        if (action.locked) {
          return { ...state, voucherError: "Voucher hanya bisa dipakai setelah Anda login." };
        }
        return { ...state, voucherError: "Memuat ulang data voucher..." };
      }
      const subtotal = getTicketSubtotal(state);
      const { appliedVoucher, voucherError } = resolveVoucher(state.voucherCode, action.vouchers, subtotal);
      return { ...state, appliedVoucher, voucherError };
    }
    case "REMOVE_VOUCHER":
      return { ...state, appliedVoucher: null, voucherCode: "" };
    case "SET_REFERRAL_CODE":
      return { ...state, referralCode: action.code, referralError: "" };
    case "APPLY_REFERRAL_STARTED":
      return { ...state, referralError: "" };
    case "APPLY_REFERRAL_SUCCESS":
      return {
        ...state,
        appliedReferral: {
          code: action.code,
          referrerName: action.referrerName,
          referrerId: action.referrerId,
        },
        referralError: "",
      };
    case "APPLY_REFERRAL_FAILURE":
      return { ...state, referralError: action.message };
    case "REMOVE_REFERRAL":
      return { ...state, referralCode: "", appliedReferral: null, referralError: "" };
    case "SET_PAYMENT_METHOD":
      return { ...state, paymentMethod: action.method };
    case "SET_PROOF_URL":
      return { ...state, proofUrl: action.url };
    case "SET_AGREE":
      return { ...state, agreeToTerms: action.value };
    case "SET_STEP":
      return { ...state, step: action.step };
    case "GO_BACK":
      if (state.step === "payment") return { ...state, step: "details", error: null };
      return state;
    case "SET_ERROR":
      return { ...state, error: action.message };
    case "ORDER_STARTED":
      return { ...state, isLoading: true, error: null, orderId: action.orderId };
    case "ORDER_CONFIRMED":
      return { ...state, step: "payment", isLoading: false, bookingId: action.bookingId };
    case "ORDER_FAILED":
      return { ...state, error: action.message, isLoading: false };
    case "PAYMENT_STARTED":
      return { ...state, isLoading: true, error: null };
    case "PAYMENT_BLOCKED":
      return { ...state, error: "Silakan unggah bukti transfer terlebih dahulu.", isLoading: false };
    case "PAYMENT_CONFIRMED":
      return { ...state, step: "confirmation", isLoading: false };
    case "PAYMENT_FAILED":
      return { ...state, error: action.message, isLoading: false };
    case "RESET":
      return {
        ...initialCheckoutState,
        customer: { ...initialCustomer },
        paymentMethod: null,
      };
    default:
      return state;
  }
}
