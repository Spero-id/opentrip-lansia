"use client";

import { useState, useCallback } from "react";
import { OrderDomain, AVAILABLE_VOUCHERS } from "../Order";

const initialCustomer = {
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

const SERVICE_FEE = 15000;

export function useCheckout(initialDestination) {
  const [state, setState] = useState({
    step: "details",
    destination: initialDestination ?? null,
    pax: 1,
    customer: { ...initialCustomer },
    voucherCode: "",
    appliedVoucher: null,
    voucherError: "",
    paymentMethod: null,
    orderId: "",
    totalAmount: 0,
    isLoading: false,
    error: null,
    agreeToTerms: false,
    bookingId: null,
  });

  const setDestination = useCallback((dest) => {
    setState((prev) => ({ ...prev, destination: dest }));
  }, []);

  const setPax = useCallback((pax) => {
    setState((prev) => ({
      ...prev,
      pax: Math.max(1, Math.min(pax, 10)),
    }));
  }, []);

  const setCustomer = useCallback((field, value) => {
    setState((prev) => ({
      ...prev,
      customer: { ...prev.customer, [field]: value },
    }));
  }, []);

  const autofillProfile = useCallback(() => {
    setState((prev) => ({
      ...prev,
      customer: {
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
      },
    }));
  }, []);

  const setVoucherCode = useCallback((code) => {
    setState((prev) => ({ ...prev, voucherCode: code, voucherError: "" }));
  }, []);

  const applyVoucher = useCallback(() => {
    setState((prev) => {
      const code = prev.voucherCode.trim().toUpperCase();
      const found = AVAILABLE_VOUCHERS.find((v) => v.code === code);
      const subtotal = (prev.destination?.priceMin ?? 0) * prev.pax;
      if (!found) {
        return { ...prev, voucherError: "Kode voucher tidak valid.", appliedVoucher: null };
      }
      if (subtotal < found.minOrder) {
        return {
          ...prev,
          voucherError: `Minimal order ${OrderDomain.formatPrice(found.minOrder)} untuk voucher ini.`,
          appliedVoucher: null,
        };
      }
      return { ...prev, appliedVoucher: found, voucherError: "" };
    });
  }, []);

  const removeVoucher = useCallback(() => {
    setState((prev) => ({ ...prev, appliedVoucher: null, voucherCode: "" }));
  }, []);

  const setPaymentMethod = useCallback((method) => {
    setState((prev) => ({ ...prev, paymentMethod: method }));
  }, []);

  const setAgreeToTerms = useCallback((value) => {
    setState((prev) => ({ ...prev, agreeToTerms: value }));
  }, []);

  const getTicketSubtotal = useCallback((s) => {
    return (s.destination?.priceMin ?? 0) * s.pax;
  }, []);

  const getDiscount = useCallback(
    (s) => {
      if (!s.appliedVoucher) return 0;
      const subtotal = getTicketSubtotal(s);
      if (s.appliedVoucher.type === "percentage") {
        return Math.round(subtotal * ((s.appliedVoucher.percentageValue ?? 0) / 100));
      }
      return s.appliedVoucher.discount;
    },
    [getTicketSubtotal]
  );

  const getTotal = useCallback(
    (s) => {
      const sub = getTicketSubtotal(s);
      const disc = getDiscount(s);
      return Math.max(0, sub + SERVICE_FEE - disc);
    },
    [getTicketSubtotal, getDiscount]
  );

  // Save booking to DB when clicking "Lanjut ke Pembayaran"
  const goToPayment = useCallback(async () => {
    let snapshot = null;

    setState((prev) => {
      if (!prev.destination) return prev;
      snapshot = {
        orderId: OrderDomain.generateOrderId(),
        destination: prev.destination,
        pax: prev.pax,
        customer: prev.customer,
        voucherCode: prev.voucherCode,
        appliedVoucher: prev.appliedVoucher,
        paymentMethod: prev.paymentMethod,
        subtotal: (prev.destination?.priceMin ?? 0) * prev.pax,
        totalAmount: getTotal(prev),
      };
      return { ...prev, isLoading: true, error: null, orderId: snapshot.orderId };
    });

    if (!snapshot) return;

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
      });

      if (!res.ok) {
        let message = "Gagal menyimpan pesanan. Silakan coba lagi.";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {}

        if (res.status === 401) {
          const redirect = encodeURIComponent(
            window.location.pathname + window.location.search
          );
          window.location.href = `/login?redirect=${redirect}`;
          return;
        }

        setState((prev) => ({ ...prev, error: message, isLoading: false }));
        return;
      }

      const data = await res.json();
      setState((prev) => ({
        ...prev,
        step: "payment",
        isLoading: false,
        bookingId: data.booking?.id,
      }));
    } catch (err) {
      console.error("Gagal menyimpan pesanan:", err);
      setState((prev) => ({
        ...prev,
        error: "Terjadi kesalahan jaringan. Silakan coba lagi.",
        isLoading: false,
      }));
    }
  }, [getTotal]);

  // Upload payment proof and update booking
  const initiatePayment = useCallback(async (paymentProofFile) => {
    if (!state.bookingId || !paymentProofFile) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const formData = new FormData();
      formData.append("bookingId", state.bookingId);
      formData.append("paymentMethod", state.paymentMethod || "manual");
      formData.append("totalAmount", String(state.totalAmount));
      if (paymentProofFile) {
        formData.append("paymentProof", paymentProofFile);
      }

      const res = await fetch("/api/payment", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let message = "Gagal memproses pembayaran. Silakan coba lagi.";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {}
        setState((prev) => ({ ...prev, error: message, isLoading: false }));
        return;
      }

      setState((prev) => ({ ...prev, step: "confirmation", isLoading: false }));
    } catch (err) {
      console.error("Gagal memproses pembayaran:", err);
      setState((prev) => ({
        ...prev,
        error: "Terjadi kesalahan jaringan. Silakan coba lagi.",
        isLoading: false,
      }));
    }
  }, [state.bookingId, state.paymentMethod, state.totalAmount]);

  const reset = useCallback(() => {
    setState({
      step: "details",
      destination: null,
      pax: 1,
      customer: { ...initialCustomer },
      voucherCode: "",
      appliedVoucher: null,
      voucherError: "",
      paymentMethod: null,
      orderId: "",
      totalAmount: 0,
      isLoading: false,
      error: null,
      agreeToTerms: false,
      bookingId: null,
    });
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.step === "payment") return { ...prev, step: "details", error: null };
      return prev;
    });
  }, []);

  const ticketSubtotal = getTicketSubtotal(state);
  const discount = getDiscount(state);
  const total = getTotal(state);

  return {
    ...state,
    serviceFee: SERVICE_FEE,
    ticketSubtotal,
    discount,
    total,
    setDestination,
    setPax,
    setCustomer,
    autofillProfile,
    setVoucherCode,
    applyVoucher,
    removeVoucher,
    setPaymentMethod,
    setAgreeToTerms,
    goToPayment,
    initiatePayment,
    reset,
    goBack,
  };
}
