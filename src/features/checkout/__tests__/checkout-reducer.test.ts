import { describe, expect, it } from "vitest";
import { checkoutReducer, initialCheckoutState } from "@/features/checkout";
import type { CheckoutState, DbVoucher } from "@/features/checkout";

const VOUCHER: DbVoucher = {
  code: "HEMAT10",
  title: "Hemat 10rb",
  value: 10000,
  type: "fixed",
  minPurchase: 0,
  maxDiscount: 0,
  usageLimit: null,
  usageCount: 0,
  validFrom: null,
  validUntil: null,
  isActive: true,
};

function makeState(overrides: Partial<CheckoutState> = {}): CheckoutState {
  return {
    ...initialCheckoutState,
    customer: { ...initialCheckoutState.customer },
    ...overrides,
  };
}

function stateWithDestination(): CheckoutState {
  return makeState({
    destination: { id: "d1", image: "", title: "Trip", priceMin: 100000 },
    pax: 1,
    voucherCode: "HEMAT10",
  });
}

describe("initial state", () => {
  it("starts on details with sane defaults", () => {
    expect(initialCheckoutState.step).toBe("details");
    expect(initialCheckoutState.pax).toBe(1);
    expect(initialCheckoutState.paymentMethod).toBe("BCA");
    expect(initialCheckoutState.agreeToTerms).toBe(false);
  });
});

describe("SET_PAX", () => {
  it("clamps below 1 up to 1", () => {
    expect(checkoutReducer(makeState(), { type: "SET_PAX", pax: 0 }).pax).toBe(1);
  });
  it("clamps above 10 down to 10", () => {
    expect(checkoutReducer(makeState(), { type: "SET_PAX", pax: 99 }).pax).toBe(10);
  });
  it("keeps in-range values", () => {
    expect(checkoutReducer(makeState(), { type: "SET_PAX", pax: 3 }).pax).toBe(3);
  });
});

describe("SET_CUSTOMER", () => {
  it("merges one field and keeps the rest", () => {
    const next = checkoutReducer(makeState(), { type: "SET_CUSTOMER", field: "fullName", value: "A" });
    expect(next.customer.fullName).toBe("A");
    expect(next.customer.phone).toBe("");
  });
  it("keeps underscore extension keys used by the pay page", () => {
    const next = checkoutReducer(makeState(), { type: "SET_CUSTOMER", field: "_bookingId", value: "b1" });
    expect((next.customer as Record<string, unknown>)._bookingId).toBe("b1");
  });
});

describe("AUTOFILL_PROFILE", () => {
  it("fills the sample customer", () => {
    const next = checkoutReducer(makeState(), { type: "AUTOFILL_PROFILE" });
    expect(next.customer.fullName).toBe("Budi Santoso");
  });
});

describe("voucher flow", () => {
  it("SET_VOUCHER_CODE stores code and clears error", () => {
    const next = checkoutReducer(
      makeState({ voucherError: "old" }),
      { type: "SET_VOUCHER_CODE", code: "x" },
    );
    expect(next.voucherCode).toBe("x");
    expect(next.voucherError).toBe("");
  });
  it("APPLY_VOUCHER warns while loading", () => {
    const next = checkoutReducer(makeState(), {
      type: "APPLY_VOUCHER", vouchers: [], loading: true, locked: false,
    });
    expect(next.voucherError).toMatch("Memuat data voucher");
  });
  it("APPLY_VOUCHER requires login when locked and empty", () => {
    const next = checkoutReducer(makeState(), {
      type: "APPLY_VOUCHER", vouchers: [], loading: false, locked: true,
    });
    expect(next.voucherError).toMatch("login");
  });
  it("APPLY_VOUCHER asks to retry when unlocked and empty", () => {
    const next = checkoutReducer(makeState(), {
      type: "APPLY_VOUCHER", vouchers: [], loading: false, locked: false,
    });
    expect(next.voucherError).toMatch("Memuat ulang");
  });
  it("APPLY_VOUCHER applies a valid code", () => {
    const next = checkoutReducer(stateWithDestination(), {
      type: "APPLY_VOUCHER", vouchers: [VOUCHER], loading: false, locked: false,
    });
    expect(next.appliedVoucher?.code).toBe("HEMAT10");
    expect(next.voucherError).toBe("");
  });
  it("APPLY_VOUCHER rejects an unknown code", () => {
    const prev = makeState({
      destination: { id: "d1", image: "", title: "Trip", priceMin: 100000 },
      pax: 1,
      voucherCode: "TIDAKADA",
    });
    const next = checkoutReducer(prev, {
      type: "APPLY_VOUCHER", vouchers: [VOUCHER], loading: false, locked: false,
    });
    expect(next.appliedVoucher).toBeNull();
    expect(next.voucherError).toBe("Kode voucher tidak valid.");
  });
  it("REMOVE_VOUCHER clears code and voucher", () => {
    const applied = checkoutReducer(stateWithDestination(), {
      type: "APPLY_VOUCHER", vouchers: [VOUCHER], loading: false, locked: false,
    });
    const next = checkoutReducer(applied, { type: "REMOVE_VOUCHER" });
    expect(next.appliedVoucher).toBeNull();
    expect(next.voucherCode).toBe("");
  });
});

describe("referral flow", () => {
  it("SET_REFERRAL_CODE stores code and clears error", () => {
    const next = checkoutReducer(
      makeState({ referralError: "old" }),
      { type: "SET_REFERRAL_CODE", code: "r" },
    );
    expect(next.referralCode).toBe("r");
    expect(next.referralError).toBe("");
  });
  it("APPLY_REFERRAL_SUCCESS stores the referral", () => {
    const next = checkoutReducer(makeState(), {
      type: "APPLY_REFERRAL_SUCCESS", code: "REF1", referrerName: "N", referrerId: "u1",
    });
    expect(next.appliedReferral?.code).toBe("REF1");
    expect(next.referralError).toBe("");
  });
  it("APPLY_REFERRAL_FAILURE stores the message", () => {
    const next = checkoutReducer(makeState(), {
      type: "APPLY_REFERRAL_FAILURE", message: "bad",
    });
    expect(next.referralError).toBe("bad");
  });
  it("REMOVE_REFERRAL clears everything", () => {
    const next = checkoutReducer(
      makeState({ referralCode: "r", referralError: "e" }),
      { type: "REMOVE_REFERRAL" },
    );
    expect(next.referralCode).toBe("");
    expect(next.appliedReferral).toBeNull();
    expect(next.referralError).toBe("");
  });
});

describe("payment flow", () => {
  it("ORDER_STARTED locks loading with the order id", () => {
    const next = checkoutReducer(makeState(), { type: "ORDER_STARTED", orderId: "o1" });
    expect(next.isLoading).toBe(true);
    expect(next.orderId).toBe("o1");
    expect(next.error).toBeNull();
  });
  it("ORDER_CONFIRMED advances to payment", () => {
    const next = checkoutReducer(
      makeState({ isLoading: true }),
      { type: "ORDER_CONFIRMED", bookingId: "b1" },
    );
    expect(next.step).toBe("payment");
    expect(next.bookingId).toBe("b1");
    expect(next.isLoading).toBe(false);
  });
  it("ORDER_FAILED surfaces the message", () => {
    const next = checkoutReducer(
      makeState({ isLoading: true }),
      { type: "ORDER_FAILED", message: "no" },
    );
    expect(next.error).toBe("no");
    expect(next.isLoading).toBe(false);
  });
  it("PAYMENT_BLOCKED asks for proof first", () => {
    const next = checkoutReducer(makeState(), { type: "PAYMENT_BLOCKED" });
    expect(next.error).toMatch("bukti transfer");
    expect(next.isLoading).toBe(false);
  });
  it("PAYMENT_CONFIRMED advances to confirmation", () => {
    const next = checkoutReducer(
      makeState({ isLoading: true }),
      { type: "PAYMENT_CONFIRMED" },
    );
    expect(next.step).toBe("confirmation");
    expect(next.isLoading).toBe(false);
  });
});

describe("navigation", () => {
  it("GO_BACK returns from payment to details and clears error", () => {
    const next = checkoutReducer(
      makeState({ step: "payment", error: "e" }),
      { type: "GO_BACK" },
    );
    expect(next.step).toBe("details");
    expect(next.error).toBeNull();
  });
  it("GO_BACK keeps other steps untouched", () => {
    const prev = makeState({ step: "details" });
    expect(checkoutReducer(prev, { type: "GO_BACK" })).toBe(prev);
  });
  it("SET_STEP switches step", () => {
    expect(checkoutReducer(makeState(), { type: "SET_STEP", step: "payment" }).step).toBe("payment");
  });
  it("RESET restores defaults with null payment method", () => {
    const next = checkoutReducer(
      makeState({ pax: 4, step: "payment", paymentMethod: "QRIS" }),
      { type: "RESET" },
    );
    expect(next.pax).toBe(1);
    expect(next.step).toBe("details");
    expect(next.paymentMethod).toBeNull();
  });
  it("SET_PAYMENT_METHOD, SET_PROOF_URL, SET_AGREE, SET_ERROR store values", () => {
    let s = checkoutReducer(makeState(), { type: "SET_PAYMENT_METHOD", method: "QRIS" });
    expect(s.paymentMethod).toBe("QRIS");
    s = checkoutReducer(s, { type: "SET_PROOF_URL", url: "u" });
    expect(s.proofUrl).toBe("u");
    s = checkoutReducer(s, { type: "SET_AGREE", value: true });
    expect(s.agreeToTerms).toBe(true);
    s = checkoutReducer(s, { type: "SET_ERROR", message: "m" });
    expect(s.error).toBe("m");
  });
});

describe("tier selection", () => {
  const tiers = [
    { id: "t1", name: "Dewasa", price: 1500000, quota: 10, remaining: 10, validFrom: null, validUntil: null },
    { id: "t2", name: "Anak", price: 750000, quota: 10, remaining: 2, validFrom: null, validUntil: null },
  ];
  it("SET_TIERS initializes first tier qty 1", () => {
    const s = checkoutReducer(makeState(), { type: "SET_TIERS", tiers });
    expect(s.tierQty).toEqual({ t1: 1 });
    expect(s.pax).toBe(1);
  });
  it("SET_TIER_QTY clamps to remaining and syncs pax", () => {
    let s = checkoutReducer(makeState(), { type: "SET_TIERS", tiers });
    s = checkoutReducer(s, { type: "SET_TIER_QTY", priceId: "t2", qty: 9 });
    expect(s.tierQty.t2).toBe(2);
    expect(s.pax).toBe(3);
    s = checkoutReducer(s, { type: "SET_TIER_QTY", priceId: "nope", qty: 5 });
    expect(s.pax).toBe(3);
  });
});
