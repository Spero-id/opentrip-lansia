"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { OrderDomain } from "../Order";
import { parseMoney, parsePromoValue } from "@/shared/promo/promo-value";
import { computePromoDiscount } from "@/shared/promo/promo-discount";

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

// Pure voucher resolver: single source of truth for client-side voucher rules.
// Used by both the "Pakai" button and goToPayment auto-apply, so the discount
// shown in the price breakdown is always the one sent to /api/checkout.
export function resolveVoucher(rawCode, vouchers, subtotal) {
  const code = String(rawCode ?? "").trim().toUpperCase();
  if (!code) {
    return { appliedVoucher: null, voucherError: "Masukkan kode voucher." };
  }

  const found = vouchers.find((v) => v.code?.trim().toUpperCase() === code);
  if (!found) {
    return { appliedVoucher: null, voucherError: "Kode voucher tidak valid." };
  }

  const minPurchase = parseMoney(found.minPurchase);
  if (minPurchase > 0 && subtotal < minPurchase) {
    return {
      appliedVoucher: null,
      voucherError: `Minimal order ${OrderDomain.formatPrice(minPurchase)} untuk voucher ini.`,
    };
  }

  if (found.usageLimit && found.usageCount >= found.usageLimit) {
    return { appliedVoucher: null, voucherError: "Voucher sudah mencapai batas pemakaian." };
  }

  const now = new Date();
  if (found.validFrom && new Date(found.validFrom) > now) {
    return { appliedVoucher: null, voucherError: "Voucher belum aktif." };
  }
  if (found.validUntil && new Date(found.validUntil) < now) {
    return { appliedVoucher: null, voucherError: "Voucher sudah kedaluwarsa." };
  }

  const value = parsePromoValue(found.value, found.type);
  const maxDiscount = parseMoney(found.maxDiscount);
  // Rumus yang sama persis dengan server (src/shared/promo/promo-discount.ts)
  const discount = computePromoDiscount(found, subtotal);

  return {
    appliedVoucher: {
      code: found.code,
      label: found.title || found.code,
      discount,
      type: found.type,
      value,
      percentageValue: found.type === "percentage" ? value : 0,
      maxDiscount,
    },
    voucherError: "",
  };
}

export function useCheckout(initialDestination) {
  const [state, setState] = useState({
    step: "details",
    destination: initialDestination ?? null,
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
  });

  const [dbVouchers, setDbVouchers] = useState([]);
  const [vouchersLoading, setVouchersLoading] = useState(true);
  const dbVouchersRef = useRef([]);
  const vouchersLoadingRef = useRef(true);
  // true kalau /api/promotions menolak karena belum login (401).
  const vouchersLockedRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => { dbVouchersRef.current = dbVouchers; }, [dbVouchers]);
  useEffect(() => { vouchersLoadingRef.current = vouchersLoading; }, [vouchersLoading]);

  // Fetch vouchers from DB on mount
  const fetchVouchers = useCallback(() => {
    fetch("/api/promotions")
      .then((res) => {
        // Daftar promo sekarang butuh login (feat-080). Jangan dianggap
        // kegagalan biasa — pesannya beda dan tak perlu di-retry.
        if (res.status === 401) {
          vouchersLockedRef.current = true;
          return [];
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setDbVouchers(data.filter((v) => v.isActive));
        } else {
          setDbVouchers([]);
        }
      })
      .catch(() => setDbVouchers([]))
      .finally(() => setVouchersLoading(false));
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

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
    // Always read from refs to avoid stale closure
    const currentVouchers = dbVouchersRef.current;
    const isLoading = vouchersLoadingRef.current;

    // If vouchers haven't loaded yet, re-fetch and show loading
    if (isLoading) {
      setState((prev) => ({ ...prev, voucherError: "Memuat data voucher, silakan coba lagi sebentar." }));
      return;
    }

    // If vouchers are empty (fetch may have failed), retry fetch
    if (currentVouchers.length === 0) {
      if (vouchersLockedRef.current) {
        setState((prev) => ({
          ...prev,
          voucherError: "Voucher hanya bisa dipakai setelah Anda login.",
        }));
        return;
      }
      fetchVouchers();
      setState((prev) => ({ ...prev, voucherError: "Memuat ulang data voucher..." }));
      return;
    }

    setState((prev) => {
      const subtotal = (prev.destination?.priceMin ?? 0) * prev.pax;
      const { appliedVoucher, voucherError } = resolveVoucher(
        prev.voucherCode,
        currentVouchers,
        subtotal
      );
      return { ...prev, appliedVoucher, voucherError };
    });
  }, [fetchVouchers]);

  const removeVoucher = useCallback(() => {
    setState((prev) => ({ ...prev, appliedVoucher: null, voucherCode: "" }));
  }, []);

  const setReferralCode = useCallback((code) => {
    setState((prev) => ({ ...prev, referralCode: code, referralError: "" }));
  }, []);

  const applyReferral = useCallback(async () => {
    const code = state.referralCode.trim();
    if (!code) return;

    setState((prev) => ({ ...prev, referralError: "" }));

    try {
      const res = await fetch("/api/checkout/validate-referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState((prev) => ({
          ...prev,
          referralError: data.error || "Kode referral tidak valid",
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        appliedReferral: {
          code: code.toUpperCase(),
          referrerName: data.referrerName,
          referrerId: data.referrerId,
        },
        referralError: "",
      }));
    } catch (_err) {
      setState((prev) => ({
        ...prev,
        referralError: "Gagal memvalidasi kode referral",
      }));
    }
  }, [state.referralCode]);

  const removeReferral = useCallback(() => {
    setState((prev) => ({
      ...prev,
      referralCode: "",
      appliedReferral: null,
      referralError: "",
    }));
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
      const av = s.appliedVoucher;
      // Hitung ulang dengan rumus bersama agar ikut berubah saat pax berubah,
      // dan hasilnya selalu sama dengan yang dihitung server.
      return computePromoDiscount(
        { type: av.type, value: av.value, maxDiscount: av.maxDiscount },
        subtotal
      );
    },
    [getTicketSubtotal]
  );

  const getTotal = useCallback(
    (s) => {
      const sub = getTicketSubtotal(s);
      const disc = getDiscount(s);
      return Math.max(0, sub - disc);
    },
    [getTicketSubtotal, getDiscount]
  );

  // Save booking to DB when clicking "Lanjut ke Pembayaran"
  const goToPayment = useCallback(async () => {
    if (!state.destination) return;

    // Auto-apply a typed-but-not-applied voucher so the price breakdown and
    // the payload sent to /api/checkout always carry the same discount.
    // Without this the server applies the discount itself and rejects the
    // request with a total mismatch (400).
    let applied = state.appliedVoucher;
    const typedCode = state.voucherCode.trim();
    if (typedCode && !applied) {
      if (vouchersLoadingRef.current || dbVouchersRef.current.length === 0) {
        if (!vouchersLockedRef.current) fetchVouchers();
        setState((prev) => ({
          ...prev,
          error: vouchersLockedRef.current
            ? "Silakan login dulu untuk memakai voucher."
            : "Data voucher belum tersedia. Mohon tunggu sebentar lalu coba lagi.",
        }));
        return;
      }
      const subtotal = (state.destination?.priceMin ?? 0) * state.pax;
      const resolved = resolveVoucher(typedCode, dbVouchersRef.current, subtotal);
      if (!resolved.appliedVoucher) {
        setState((prev) => ({
          ...prev,
          appliedVoucher: null,
          voucherError: resolved.voucherError,
          error: resolved.voucherError,
        }));
        return;
      }
      applied = resolved.appliedVoucher;
      // Surface the discounted price in the breakdown before moving on
      setState((prev) => ({ ...prev, appliedVoucher: applied, voucherError: "" }));
    }

    const pricingState = applied ? { ...state, appliedVoucher: applied } : state;

    const snapshot = {
      orderId: OrderDomain.generateOrderId(),
      destination: state.destination,
      pax: state.pax,
      customer: state.customer,
      voucherCode: applied?.code ?? null,
      appliedVoucher: applied,
      referralCode: state.appliedReferral?.code || null,
      paymentMethod: state.paymentMethod,
      proofUrl: state.proofUrl,
      subtotal: (state.destination?.priceMin ?? 0) * state.pax,
      totalAmount: getTotal(pricingState),
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
  }, [state, getTotal, fetchVouchers]);

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
      referralCode: "",
      appliedReferral: null,
      referralError: "",
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
    vouchersLoading,
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
    setReferralCode,
    applyReferral,
    removeReferral,
    setPaymentMethod,
    setProofUrl,
    setAgreeToTerms,
    goToPayment,
    initiatePayment,
    reset,
    goBack,
  };
}


