"use client";

import { useState, useCallback, useEffect } from "react";
import { OrderDomain } from "../Order";

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
    proofUrl: "",
    orderId: "",
    totalAmount: 0,
    isLoading: false,
    error: null,
    agreeToTerms: false,
    bookingId: null,
  });

  const [dbVouchers, setDbVouchers] = useState([]);

  // Fetch vouchers from DB on mount
  useEffect(() => {
    fetch("/api/promotions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDbVouchers(data.filter((v) => v.isActive));
        }
      })
      .catch(() => {});
  }, []);

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
      const subtotal = (prev.destination?.priceMin ?? 0) * prev.pax;

      // Look up in DB vouchers
      const found = dbVouchers.find((v) => v.code?.toUpperCase() === code);
      if (!found) {
        return { ...prev, voucherError: "Kode voucher tidak valid.", appliedVoucher: null };
      }

      // Check min purchase
      const minPurchase = Number(found.minPurchase) || 0;
      if (minPurchase > 0 && subtotal < minPurchase) {
        return {
          ...prev,
          voucherError: `Minimal order ${OrderDomain.formatPrice(minPurchase)} untuk voucher ini.`,
          appliedVoucher: null,
        };
      }

      // Check usage limit
      if (found.usageLimit && found.usageCount >= found.usageLimit) {
        return { ...prev, voucherError: "Voucher sudah mencapai batas pemakaian.", appliedVoucher: null };
      }

      // Check validity period
      const now = new Date();
      if (found.validFrom && new Date(found.validFrom) > now) {
        return { ...prev, voucherError: "Voucher belum aktif.", appliedVoucher: null };
      }
      if (found.validUntil && new Date(found.validUntil) < now) {
        return { ...prev, voucherError: "Voucher sudah kedaluwarsa.", appliedVoucher: null };
      }

      // Calculate discount
      const value = Number(found.value) || 0;
      let discount = 0;
      if (found.type === "percentage") {
        discount = Math.round(subtotal * (value / 100));
        const maxDiscount = Number(found.maxDiscount) || 0;
        if (maxDiscount > 0) discount = Math.min(discount, maxDiscount);
      } else {
        discount = value;
      }
      discount = Math.min(discount, subtotal);

      return {
        ...prev,
        appliedVoucher: {
          code: found.code,
          label: found.title || found.code,
          discount,
          type: found.type,
          value,
          percentageValue: found.type === "percentage" ? value : 0,
        },
        voucherError: "",
      };
    });
  }, [dbVouchers]);

  const removeVoucher = useCallback(() => {
    setState((prev) => ({ ...prev, appliedVoucher: null, voucherCode: "" }));
  }, []);

  const setPaymentMethod = useCallback((method) => {
    setState((prev) => ({ ...prev, paymentMethod: method }));
  }, []);

  const setProofUrl = useCallback((url) => {
    setState((prev) => ({ ...prev, proofUrl: url }));
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
    if (!state.destination) return;

    const snapshot = {
      orderId: OrderDomain.generateOrderId(),
      destination: state.destination,
      pax: state.pax,
      customer: state.customer,
      voucherCode: state.voucherCode,
      appliedVoucher: state.appliedVoucher,
      paymentMethod: state.paymentMethod,
      proofUrl: state.proofUrl,
      subtotal: (state.destination?.priceMin ?? 0) * state.pax,
      totalAmount: getTotal(state),
    };

    setState((prev) => ({ ...prev, isLoading: true, error: null, orderId: snapshot.orderId }));

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
  }, [state, getTotal]);

  // Submit payment proof to create a payment record
  const initiatePayment = useCallback(async () => {
    if (!state.bookingId || !state.proofUrl) {
      setState((prev) => ({
        ...prev,
        error: "Silakan unggah bukti transfer terlebih dahulu.",
        isLoading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: state.bookingId,
          paymentMethod: state.paymentMethod || "manual",
          proofUrl: state.proofUrl,
        }),
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
  }, [state.bookingId, state.paymentMethod, state.proofUrl]);

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
      proofUrl: "",
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
    setProofUrl,
    setAgreeToTerms,
    goToPayment,
    initiatePayment,
    reset,
    goBack,
  };
}


