import type { PaymentAccountLike } from "@/features/payment/payment-account";
import type { BookingSnapshot, DbVoucher } from "@/features/checkout";

export class ApiRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function fetchPromotions(): Promise<{ vouchers: DbVoucher[]; locked: boolean }> {
  const res = await fetch("/api/promotions");
  if (res.status === 401) return { vouchers: [], locked: true };
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return {
    vouchers: Array.isArray(data) ? data.filter((v) => v?.isActive) : [],
    locked: false,
  };
}

export async function validateReferralCode(
  code: string,
): Promise<{ referrerName: string | null; referrerId: string | null }> {
  let res: Response;
  try {
    res = await fetch("/api/checkout/validate-referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referralCode: code }),
    });
  } catch {
    throw new Error("Gagal memvalidasi kode referral");
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Kode referral tidak valid");
  return { referrerName: data?.referrerName ?? null, referrerId: data?.referrerId ?? null };
}

export async function createBookingOrder(
  snapshot: BookingSnapshot,
): Promise<{ bookingId: string | null }> {
  let res: Response;
  try {
    res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    });
  } catch {
    throw new Error("Terjadi kesalahan jaringan. Silakan coba lagi.");
  }
  if (!res.ok) {
    let message = "Gagal menyimpan pesanan. Silakan coba lagi.";
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {}
    throw new ApiRequestError(message, res.status);
  }
  const data = await res.json();
  return { bookingId: data?.booking?.id ?? null };
}

export async function submitPayment(payload: {
  bookingId: string;
  paymentMethod: string;
  proofUrl: string;
}): Promise<void> {
  let res: Response;
  try {
    res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Terjadi kesalahan jaringan. Silakan coba lagi.");
  }
  if (!res.ok) {
    let message = "Gagal memproses pembayaran. Silakan coba lagi.";
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {}
    throw new ApiRequestError(message, res.status);
  }
}

export async function fetchPaymentAccounts(): Promise<PaymentAccountLike[]> {
  const res = await fetch("/api/payments/accounts");
  if (!res.ok) throw new Error(`Accounts request failed: ${res.status}`);
  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new Error("Invalid accounts response");
  return data as PaymentAccountLike[];
}
