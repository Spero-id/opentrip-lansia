"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { OrderDomain } from "@/lib/order";
import {
  ApiRequestError,
  checkoutReducer,
  createBookingOrder,
  fetchPromotions,
  getDiscount,
  getTicketSubtotal,
  getTotal,
  initialCheckoutState,
  resolveVoucher,
  submitPayment,
  validateReferralCode,
} from "@/features/checkout";
import type { DbVoucher, DestinationSummary } from "@/features/checkout";
import type { BookingSnapshot } from "@/features/checkout";

export function useCheckout(initialDestination: DestinationSummary | null) {
  const [state, dispatch] = useReducer(checkoutReducer, {
    ...initialCheckoutState,
    destination: initialDestination ?? null,
  });
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  const [dbVouchers, setDbVouchers] = useState<DbVoucher[]>([]);
  const [vouchersLoading, setVouchersLoading] = useState(true);
  const dbVouchersRef = useRef<DbVoucher[]>([]);
  const vouchersLoadingRef = useRef(true);
  const vouchersLockedRef = useRef(false);

  const fetchVouchers = useCallback(async () => {
    try {
      const { vouchers, locked } = await fetchPromotions();
      if (locked) vouchersLockedRef.current = true;
      setDbVouchers(vouchers);
    } catch {
      setDbVouchers([]);
    } finally {
      setVouchersLoading(false);
    }
  }, []);

  useEffect(() => {
    dbVouchersRef.current = dbVouchers;
  }, [dbVouchers]);
  useEffect(() => {
    vouchersLoadingRef.current = vouchersLoading;
  }, [vouchersLoading]);
  useEffect(() => {
    let cancelled = false;
    fetchPromotions()
      .then(({ vouchers, locked }) => {
        if (cancelled) return;
        if (locked) vouchersLockedRef.current = true;
        setDbVouchers(vouchers);
        setVouchersLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setDbVouchers([]);
          setVouchersLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setDestination = (destination: DestinationSummary | null) =>
    dispatch({ type: "SET_DESTINATION", destination });
  const setPax = (pax: number) => dispatch({ type: "SET_PAX", pax });
  const setCustomer = (field: string, value: unknown) =>
    dispatch({ type: "SET_CUSTOMER", field, value });
  const autofillProfile = () => dispatch({ type: "AUTOFILL_PROFILE" });
  const setVoucherCode = (code: string) => dispatch({ type: "SET_VOUCHER_CODE", code });

  const applyVoucher = () => {
    if (
      !vouchersLoadingRef.current &&
      dbVouchersRef.current.length === 0 &&
      !vouchersLockedRef.current
    ) {
      void fetchVouchers();
    }
    dispatch({
      type: "APPLY_VOUCHER",
      vouchers: dbVouchersRef.current,
      loading: vouchersLoadingRef.current,
      locked: vouchersLockedRef.current,
    });
  };

  const removeVoucher = () => dispatch({ type: "REMOVE_VOUCHER" });
  const setReferralCode = (code: string) => dispatch({ type: "SET_REFERRAL_CODE", code });

  const applyReferral = async () => {
    const code = stateRef.current.referralCode.trim();
    if (!code) return;
    dispatch({ type: "APPLY_REFERRAL_STARTED" });
    try {
      const { referrerName, referrerId } = await validateReferralCode(code);
      dispatch({ type: "APPLY_REFERRAL_SUCCESS", code: code.toUpperCase(), referrerName, referrerId });
    } catch (err: unknown) {
      dispatch({
        type: "APPLY_REFERRAL_FAILURE",
        message: err instanceof Error ? err.message : "Gagal memvalidasi kode referral",
      });
    }
  };

  const removeReferral = () => dispatch({ type: "REMOVE_REFERRAL" });
  const setPaymentMethod = (method: string | null) =>
    dispatch({ type: "SET_PAYMENT_METHOD", method });
  const setProofUrl = (url: string) => dispatch({ type: "SET_PROOF_URL", url });
  const setAgreeToTerms = (value: boolean) => dispatch({ type: "SET_AGREE", value });

  const goToPayment = async () => {
    const s = stateRef.current;
    if (!s.destination) return;

    let applied = s.appliedVoucher;
    const typedCode = s.voucherCode.trim();
    if (typedCode && !applied) {
      if (vouchersLoadingRef.current || dbVouchersRef.current.length === 0) {
        if (!vouchersLockedRef.current) void fetchVouchers();
        dispatch({
          type: "SET_ERROR",
          message: vouchersLockedRef.current
            ? "Silakan login dulu untuk memakai voucher."
            : "Data voucher belum tersedia. Mohon tunggu sebentar lalu coba lagi.",
        });
        return;
      }
      const subtotal = (s.destination?.priceMin ?? 0) * s.pax;
      const resolved = resolveVoucher(typedCode, dbVouchersRef.current, subtotal);
      if (!resolved.appliedVoucher) {
        dispatch({
          type: "APPLY_VOUCHER",
          vouchers: dbVouchersRef.current,
          loading: false,
          locked: vouchersLockedRef.current,
        });
        dispatch({ type: "SET_ERROR", message: resolved.voucherError });
        return;
      }
      applied = resolved.appliedVoucher;
      dispatch({
        type: "APPLY_VOUCHER",
        vouchers: dbVouchersRef.current,
        loading: false,
        locked: vouchersLockedRef.current,
      });
    }

    const pricingState = applied ? { ...s, appliedVoucher: applied } : s;
    const snapshot: BookingSnapshot = {
      orderId: OrderDomain.generateOrderId(),
      destination: s.destination,
      pax: s.pax,
      customer: s.customer,
      voucherCode: applied?.code ?? null,
      appliedVoucher: applied,
      referralCode: s.appliedReferral?.code || null,
      paymentMethod: s.paymentMethod,
      proofUrl: s.proofUrl,
      subtotal: (s.destination?.priceMin ?? 0) * s.pax,
      totalAmount: getTotal(pricingState),
    };

    dispatch({ type: "ORDER_STARTED", orderId: snapshot.orderId });
    try {
      const { bookingId } = await createBookingOrder(snapshot);
      dispatch({ type: "ORDER_CONFIRMED", bookingId });
    } catch (err: unknown) {
      if (err instanceof ApiRequestError && err.status === 401) {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?redirect=${redirect}`;
        return;
      }
      dispatch({
        type: "ORDER_FAILED",
        message: err instanceof Error ? err.message : "Gagal menyimpan pesanan. Silakan coba lagi.",
      });
    }
  };

  const initiatePayment = async () => {
    const s = stateRef.current;
    if (!s.bookingId || !s.proofUrl) {
      dispatch({ type: "PAYMENT_BLOCKED" });
      return;
    }
    dispatch({ type: "PAYMENT_STARTED" });
    try {
      await submitPayment({
        bookingId: s.bookingId,
        paymentMethod: s.paymentMethod || "manual",
        proofUrl: s.proofUrl,
      });
      dispatch({ type: "PAYMENT_CONFIRMED" });
    } catch (err: unknown) {
      dispatch({
        type: "PAYMENT_FAILED",
        message: err instanceof Error ? err.message : "Gagal memproses pembayaran. Silakan coba lagi.",
      });
    }
  };

  const reset = () => dispatch({ type: "RESET" });
  const goBack = () => dispatch({ type: "GO_BACK" });

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
