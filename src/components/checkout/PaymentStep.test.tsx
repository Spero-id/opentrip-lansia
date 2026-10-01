import { afterEach, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import PaymentStep from "./PaymentStep";

type Setter = (m: string | null) => void;

function makeCheckout(setPaymentMethod: Setter, overrides: Record<string, unknown> = {}) {
  return {
    destination: { title: "Trip Contoh", priceMin: 2200000 },
    paymentMethod: "BCA",
    setPaymentMethod,
    proofUrl: "",
    error: null,
    isLoading: false,
    ticketSubtotal: 2200000,
    discount: 0,
    total: 2200000,
    appliedVoucher: null,
    setProofUrl: () => {},
    ...overrides,
  } as never;
}

function mockAccountsApi(body: unknown, ok = true) {
  (global as never as { fetch: unknown }).fetch = vi.fn().mockResolvedValue({
    ok,
    json: async () => body,
  });
}

afterEach(() => {
  vi.resetAllMocks();
});

it("menyembunyikan opsi BCA saat rekening belum ada di server", async () => {
  mockAccountsApi([]);
  const setPaymentMethod = vi.fn();

  render(
    <PaymentStep
      checkout={makeCheckout(setPaymentMethod)}
      onPay={() => {}}
      onBack={() => {}}
    />
  );

  await waitFor(() => {
    expect(setPaymentMethod).toHaveBeenCalledWith("QRIS");
  });
  expect(screen.queryByText("Transfer Bank BCA")).toBeNull();
  expect(screen.getByText("Scan QRIS untuk pembayaran")).toBeTruthy();
});

it("menyembunyikan opsi BCA saat nomor rekening kosong", async () => {
  mockAccountsApi([
    {
      method: "BCA",
      bankName: "Bank BCA",
      accountNumber: "   ",
      accountHolder: "PT. SINERGI INOVASI KARYA",
      isActive: true,
    },
  ]);
  const setPaymentMethod = vi.fn();

  render(
    <PaymentStep
      checkout={makeCheckout(setPaymentMethod)}
      onPay={() => {}}
      onBack={() => {}}
    />
  );

  await waitFor(() => {
    expect(setPaymentMethod).toHaveBeenCalledWith("QRIS");
  });
  expect(screen.queryByText("Transfer Bank BCA")).toBeNull();
  expect(screen.queryByText("Salin")).toBeNull();
});

it("menampilkan BCA beserta kartu rekening ketika rekening lengkap", async () => {
  mockAccountsApi([
    {
      method: "BCA",
      bankName: "Bank BCA",
      accountNumber: "6802082513",
      accountHolder: "PT. SINERGI INOVASI KARYA",
      isActive: true,
    },
  ]);
  const setPaymentMethod = vi.fn();

  render(
    <PaymentStep
      checkout={makeCheckout(setPaymentMethod)}
      onPay={() => {}}
      onBack={() => {}}
    />
  );

  await waitFor(() => {
    expect(screen.getByText("Transfer Bank BCA")).toBeTruthy();
  });
  expect(setPaymentMethod).not.toHaveBeenCalledWith("QRIS");
  expect(screen.getByText("6802082513")).toBeTruthy();
  expect(screen.getByText("PT. SINERGI INOVASI KARYA")).toBeTruthy();
});

it("menyembunyikan BCA (fail-closed) kalau API rekening gagal dimuat", async () => {
  (global as never as { fetch: unknown }).fetch = vi
    .fn()
    .mockRejectedValue(new Error("network down"));
  const setPaymentMethod = vi.fn();

  render(
    <PaymentStep
      checkout={makeCheckout(setPaymentMethod)}
      onPay={() => {}}
      onBack={() => {}}
    />
  );

  await waitFor(() => {
    expect(setPaymentMethod).toHaveBeenCalledWith("QRIS");
  });
  expect(screen.queryByText("Transfer Bank BCA")).toBeNull();
  expect(screen.getByText("Scan QRIS untuk pembayaran")).toBeTruthy();
});
