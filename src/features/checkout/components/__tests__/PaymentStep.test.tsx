import { afterEach, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { PaymentStep } from "@/features/checkout";
import type { useCheckout } from "@/features/checkout/hooks/use-checkout";

type CheckoutHook = ReturnType<typeof useCheckout>;
type Setter = (m: string | null) => void;

const COMPLETE_BCA_ACCOUNT = {
  method: "BCA",
  bankName: "Bank BCA",
  accountNumber: "6802082513",
  accountHolder: "PT. SINERGI INOVASI KARYA",
  isActive: true,
};

function makeCheckout(setPaymentMethod: Setter): CheckoutHook {
  return {
    destination: { id: "d1", image: "", title: "Trip Contoh", priceMin: 2200000 },
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
  } as unknown as CheckoutHook;
}

function stubAccountsFetch(response: unknown) {
  const fetchMock =
    response instanceof Error
      ? vi.fn().mockRejectedValue(response)
      : vi.fn().mockResolvedValue({ ok: true, json: async () => response });
  (global as never as { fetch: unknown }).fetch = fetchMock;
}

function renderPaymentStep() {
  const setPaymentMethod = vi.fn();
  render(
    <PaymentStep checkout={makeCheckout(setPaymentMethod)} onPay={() => {}} onBack={() => {}} />
  );
  return setPaymentMethod;
}

afterEach(() => {
  vi.resetAllMocks();
});

it("switches to QRIS and hides BCA when the server has no accounts", async () => {
  stubAccountsFetch([]);

  const setPaymentMethod = renderPaymentStep();

  await waitFor(() => {
    expect(setPaymentMethod).toHaveBeenCalledWith("QRIS");
  });
  expect(screen.queryByText("Transfer Bank BCA")).toBeNull();
  expect(screen.getByText("Scan QRIS untuk pembayaran")).toBeTruthy();
});

it("hides BCA when the account number is blank", async () => {
  stubAccountsFetch([{ ...COMPLETE_BCA_ACCOUNT, accountNumber: "   " }]);

  const setPaymentMethod = renderPaymentStep();

  await waitFor(() => {
    expect(setPaymentMethod).toHaveBeenCalledWith("QRIS");
  });
  expect(screen.queryByText("Transfer Bank BCA")).toBeNull();
  expect(screen.queryByText("Salin")).toBeNull();
});

it("shows BCA with its account card when the account is complete", async () => {
  stubAccountsFetch([COMPLETE_BCA_ACCOUNT]);

  const setPaymentMethod = renderPaymentStep();

  await waitFor(() => {
    expect(screen.getByText("Transfer Bank BCA")).toBeTruthy();
  });
  expect(setPaymentMethod).not.toHaveBeenCalledWith("QRIS");
  expect(screen.getByText("6802082513")).toBeTruthy();
  expect(screen.getByText("PT. SINERGI INOVASI KARYA")).toBeTruthy();
});

it("fails closed to QRIS when the accounts request rejects", async () => {
  stubAccountsFetch(new Error("network down"));

  const setPaymentMethod = renderPaymentStep();

  await waitFor(() => {
    expect(setPaymentMethod).toHaveBeenCalledWith("QRIS");
  });
  expect(screen.queryByText("Transfer Bank BCA")).toBeNull();
  expect(screen.getByText("Scan QRIS untuk pembayaran")).toBeTruthy();
});
