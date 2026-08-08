"use client";

import { useState, useCallback } from "react";
import { OrderDomain, AVAILABLE_VOUCHERS } from "../Order";

const initialCustomer = {
  fullName: "",
  email: "",
  phone: "",
  specialRequest: "",
};

const SERVICE_FEE = 15000;

function createEmptyParticipant() {
  return {
    id: OrderDomain.generateParticipantId(),
    fullName: "",
    birthDate: "",
    gender: "",
    phone: "",
    email: "",
    relationship: "",
  };
}

export function useCheckout(initialDestination) {
  const [state, setState] = useState({
    step: "details",
    destination: initialDestination ?? null,
    pax: 1,
    travelDate: "",
    customer: { ...initialCustomer },
    participants: [createEmptyParticipant()],
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
  });

  const setDestination = useCallback((dest) => {
    setState((prev) => ({ ...prev, destination: dest }));
  }, []);

  const setPax = useCallback((pax) => {
    setState((prev) => {
      const current = prev.participants.length;
      if (pax === current) return { ...prev, pax };
      if (pax > current) {
        const participants = [...prev.participants];
        for (let i = current; i < pax; i++) {
          participants.push(createEmptyParticipant());
        }
        return { ...prev, pax, participants };
      }
      return { ...prev, pax, participants: prev.participants.slice(0, pax) };
    });
  }, []);

  const setTravelDate = useCallback((date) => {
    setState((prev) => ({ ...prev, travelDate: date }));
  }, []);

  const setCustomer = useCallback((field, value) => {
    setState((prev) => ({
      ...prev,
      customer: { ...prev.customer, [field]: value },
      participants: ["fullName", "email", "phone"].includes(field)
        ? prev.participants.map((p, i) => (i === 0 ? { ...p, [field]: value } : p))
        : prev.participants,
    }));
  }, []);

  const autofillProfile = useCallback(() => {
    setState((prev) => ({
      ...prev,
      customer: {
        fullName: "Budi Santoso",
        email: "budi.santoso@email.com",
        phone: "081234567890",
        specialRequest: prev.customer.specialRequest,
      },
      participants: prev.participants.map((p, i) =>
        i === 0
          ? { ...p, fullName: "Budi Santoso", email: "budi.santoso@email.com", phone: "081234567890" }
          : p
      ),
    }));
  }, []);

  const addParticipant = useCallback(() => {
    const newP = {
      id: OrderDomain.generateParticipantId(),
      fullName: "",
      birthDate: "",
      gender: "",
      phone: "",
      email: "",
      relationship: "",
    };
    setState((prev) => ({
      ...prev,
      participants: [...prev.participants, newP],
    }));
  }, []);

  const updateParticipant = useCallback(
    (id, field, value) => {
      setState((prev) => ({
        ...prev,
        participants: prev.participants.map((p) =>
          p.id === id ? { ...p, [field]: value } : p
        ),
      }));
    },
    []
  );

  const removeParticipant = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p.id !== id),
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

  const setProofUrl = useCallback((url) => {
    setState((prev) => ({ ...prev, proofUrl: url }));
  }, []);

  const setAgreeToTerms = useCallback((value) => {
    setState((prev) => ({ ...prev, agreeToTerms: value }));
  }, []);

  const getTicketSubtotal = useCallback((s) => {
    return (s.destination?.priceMin ?? 0) * s.pax;
  }, []);

  const getDiscount = useCallback((s) => {
    if (!s.appliedVoucher) return 0;
    const subtotal = getTicketSubtotal(s);
    if (s.appliedVoucher.type === "percentage") {
      return Math.round(subtotal * ((s.appliedVoucher.percentageValue ?? 0) / 100));
    }
    return s.appliedVoucher.discount;
  }, [getTicketSubtotal]);

  const getTotal = useCallback((s) => {
    const sub = getTicketSubtotal(s);
    const disc = getDiscount(s);
    return Math.max(0, sub + SERVICE_FEE - disc);
  }, [getTicketSubtotal, getDiscount]);

  const goToPayment = useCallback(() => {
    setState((prev) => {
      if (!prev.destination || !prev.travelDate) return prev;
      const orderId = OrderDomain.generateOrderId();
      const total = getTotal(prev);
      return { ...prev, step: "payment", orderId, totalAmount: total };
    });
  }, [getTotal]);

  const initiatePayment = useCallback(async () => {
    let snapshot = null;

    setState((prev) => {
      if (!prev.destination) return prev;
      snapshot = {
        orderId: prev.orderId,
        destination: prev.destination,
        pax: prev.pax,
        travelDate: prev.travelDate,
        customer: prev.customer,
        participants: prev.participants,
        voucherCode: prev.voucherCode,
        appliedVoucher: prev.appliedVoucher,
        paymentMethod: prev.paymentMethod,
        proofUrl: prev.proofUrl,
        subtotal: (prev.destination?.priceMin ?? 0) * prev.pax,
        totalAmount: prev.totalAmount,
      };
      return { ...prev, isLoading: true, error: null };
    });

    if (!snapshot) return;

    // Simulasi proses payment 1 detik
    await new Promise((r) => setTimeout(r, 1000));

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
      });

      if (!res.ok) {
        let message = "Gagal memproses pesanan. Silakan coba lagi.";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          // ignore parse error, pakai pesan default
        }

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

      setState((prev) => ({ ...prev, step: "confirmation", isLoading: false }));
    } catch (err) {
      console.error("Gagal menyimpan pesanan:", err);
      setState((prev) => ({
        ...prev,
        error: "Terjadi kesalahan jaringan. Silakan coba lagi.",
        isLoading: false,
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      step: "details",
      destination: null,
      pax: 1,
      travelDate: "",
      customer: { ...initialCustomer },
      participants: [createEmptyParticipant()],
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
    });
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: "details",
      error: null,
    }));
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
    setTravelDate,
    setCustomer,
    autofillProfile,
    addParticipant,
    updateParticipant,
    removeParticipant,
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
