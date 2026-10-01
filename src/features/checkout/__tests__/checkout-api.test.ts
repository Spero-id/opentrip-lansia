import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApiRequestError,
  createBookingOrder,
  fetchPaymentAccounts,
  fetchPromotions,
  submitPayment,
  validateReferralCode,
} from "@/features/checkout";

function mockFetchOnce(payload: unknown, ok = true, status = 200) {
  const fn = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(payload),
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchPromotions", () => {
  it("returns locked on 401", async () => {
    mockFetchOnce({}, false, 401);
    await expect(fetchPromotions()).resolves.toEqual({ vouchers: [], locked: true });
  });
  it("filters inactive vouchers", async () => {
    mockFetchOnce([
      { code: "A", isActive: true },
      { code: "B", isActive: false },
    ]);
    const { vouchers, locked } = await fetchPromotions();
    expect(locked).toBe(false);
    expect(vouchers.map((v) => v.code)).toEqual(["A"]);
  });
  it("returns empty list for non-array payloads", async () => {
    mockFetchOnce({ error: "x" });
    await expect(fetchPromotions()).resolves.toEqual({ vouchers: [], locked: false });
  });
});

describe("validateReferralCode", () => {
  it("returns referrer on success", async () => {
    mockFetchOnce({ referrerName: "N", referrerId: "u1" });
    await expect(validateReferralCode("REF1")).resolves.toEqual({ referrerName: "N", referrerId: "u1" });
  });
  it("throws the server message on rejection", async () => {
    mockFetchOnce({ error: "dipakai sendiri" }, false, 400);
    await expect(validateReferralCode("REF1")).rejects.toThrow("dipakai sendiri");
  });
  it("throws the default message without server message", async () => {
    mockFetchOnce({}, false, 400);
    await expect(validateReferralCode("REF1")).rejects.toThrow("Kode referral tidak valid");
  });
  it("throws the network message on failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    await expect(validateReferralCode("REF1")).rejects.toThrow("Gagal memvalidasi kode referral");
  });
});

describe("createBookingOrder", () => {
  const snapshot = {
    orderId: "o1",
    destination: null,
    pax: 1,
    customer: {},
    voucherCode: null,
    appliedVoucher: null,
    referralCode: null,
    paymentMethod: "BCA",
    proofUrl: "",
    subtotal: 0,
    totalAmount: 0,
  };
  it("returns the booking id on success", async () => {
    mockFetchOnce({ booking: { id: "b1" } });
    await expect(createBookingOrder(snapshot)).resolves.toEqual({ bookingId: "b1" });
  });
  it("carries the status on request errors", async () => {
    mockFetchOnce({ error: "Penuh" }, false, 409);
    const err = await createBookingOrder(snapshot).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiRequestError);
    expect((err as ApiRequestError).status).toBe(409);
    expect((err as Error).message).toBe("Penuh");
  });
  it("throws the network message on failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    await expect(createBookingOrder(snapshot)).rejects.toThrow("kesalahan jaringan");
  });
});

describe("submitPayment", () => {
  const payload = { bookingId: "b1", paymentMethod: "BCA", proofUrl: "u" };
  it("resolves on success", async () => {
    mockFetchOnce({ ok: true });
    await expect(submitPayment(payload)).resolves.toBeUndefined();
  });
  it("throws the server message on rejection", async () => {
    mockFetchOnce({ error: "ditolak" }, false, 400);
    await expect(submitPayment(payload)).rejects.toThrow("ditolak");
  });
});

describe("fetchPaymentAccounts", () => {
  it("returns the accounts array", async () => {
    mockFetchOnce([{ method: "BCA" }]);
    await expect(fetchPaymentAccounts()).resolves.toEqual([{ method: "BCA" }]);
  });
  it("throws on non-ok response", async () => {
    mockFetchOnce({}, false, 500);
    await expect(fetchPaymentAccounts()).rejects.toThrow("500");
  });
  it("throws on non-array payloads", async () => {
    mockFetchOnce({ accounts: [] });
    await expect(fetchPaymentAccounts()).rejects.toThrow("Invalid accounts");
  });
});
