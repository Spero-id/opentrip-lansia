"use client";

import { useState, useEffect, useReducer, type FormEvent } from "react";
import { Clock, ChevronRight, AlertCircle } from "lucide-react";
import PageHeader from "@/features/private-trip/components/PageHeader";
import BookingInformationSection from "@/features/private-trip/components/BookingInformationSection";
import TripDetailSection from "@/features/private-trip/components/TripDetailSection";
import FacilitiesSection from "@/features/private-trip/components/FacilitiesSection";
import SuccessState from "@/features/private-trip/components/SuccessState";
import SubmitBar from "@/features/private-trip/components/SubmitBar";
import TermsModal from "@/features/private-trip/components/TermsModal";
import Subs from "@/components/landing/Subs";
import { initialForm } from "@/features/private-trip/components/helpers/initialState";
import { validate } from "@/features/private-trip/components/helpers/validation";
import { privateTripReducer } from "@/features/private-trip/reducer";
import {
  buildPayload,
  fetchDestinations,
  submitPrivateTripRequest,
} from "@/features/private-trip/api/client";
import type { FormErrors, PrivateTripDestination, PrivateTripForm, PrivateTripPayload } from "@/features/private-trip/types";

const STORAGE_KEY = "private-trip-form-draft";

export default function PrivateTripPage() {
  const [state, dispatch] = useReducer(privateTripReducer, {
    form: { ...initialForm },
    errors: {},
    destinations: [],
    submitted: false,
    requestId: null,
    showTerms: false,
    isLoading: false,
    submitError: null,
  });
  const { form, errors, destinations, submitted, requestId, showTerms, isLoading, submitError } = state;
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PrivateTripForm>;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional hydration from sessionStorage
        dispatch({ type: "HYDRATE_DRAFT", draft: parsed });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mark hydrated after mount
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {}
  }, [form, isHydrated]);

  useEffect(() => {
    let cancelled = false;
    fetchDestinations()
      .then((items) => {
        if (!cancelled) dispatch({ type: "DESTINATIONS_LOADED", destinations: items });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const set = (field: string, value: unknown) => {
    dispatch({ type: "SET_FIELD", field, value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      dispatch({ type: "SET_ERRORS", errors: errs });

      const fieldOrder = [
        "namaInstitusi",
        "nama",
        "phone",
        "email",
        "customTripName",
        "selectedDestinasi",
        "jumlahPeserta",
        "durasi",
        "tanggal",
        "meetingPoint",
        "transportNeeds",
        "standarPenginapan",
        "metodeKontak",
      ];
      const firstErrorKey = fieldOrder.find((k) => errs[k]);
      if (firstErrorKey) {
        const el = document.getElementById(`field-${firstErrorKey}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          const focusable: HTMLElement | null = el.matches("input,select,textarea")
            ? (el as HTMLElement)
            : el.querySelector<HTMLElement>("input,select,textarea");
          if (focusable) setTimeout(() => focusable.focus({ preventScroll: true }), 350);
        }
      }
      return;
    }
    dispatch({ type: "SET_TERMS", open: true });
  };

  const handleAgree = async () => {
    dispatch({ type: "SUBMIT_STARTED" });

    try {
      const payload = buildPayload(form, budgetValue);
      const { id } = await submitPrivateTripRequest(payload);
      dispatch({ type: "SUBMIT_SUCCEEDED", requestId: id });
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {}
    } catch (err: unknown) {
      dispatch({
        type: "SUBMIT_FAILED",
        message: err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi.",
      });
    }
  };

  const resetForm = () => {
    dispatch({ type: "RESET_FORM" });
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const budgetValue = form.tripType === "explorer" && form.selectedDestinasi
    ? form.selectedDestinasi.priceMin
    : form.budget;

  if (submitted) {
    return (
      <SuccessState
        form={form}
        requestId={requestId}
        onReset={resetForm}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {showTerms && (
        <TermsModal
          onAgree={handleAgree}
          onClose={() => dispatch({ type: "SET_TERMS", open: false })}
        />
      )}

      <main className="min-h-screen bg-[#F9FAFB]">

        <div className="bg-[#F9FAFB]">
          <PageHeader />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
            <a
              href="/my-trips"
              className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border border-[#FDE6C8] bg-[#FFFBEB] hover:bg-[#FFF6DA] transition-colors group shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-center gap-3.5">
                <span className="w-8 h-8 rounded-full bg-[#FFF1CC] border border-[#FDE6C8] flex items-center justify-center shrink-0">
                  <Clock size={16} color="#EAA300" strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-[#1F2937] leading-tight">Sudah pernah mengajukan request?</p>
                  <p className="text-xs text-[#6B7280] leading-none mt-1">Pantau status dan lihat proposal dari admin</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#EAA300] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-5">

              <BookingInformationSection
                form={form}
                set={set}
                errors={errors}
              />
              <TripDetailSection
                form={form}
                set={set}
                errors={errors}
                destinationsData={destinations}
              />
              <FacilitiesSection form={form} set={set} errors={errors} />

              {Object.keys(errors).length > 0 && (
                <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-[13px]">
                  <AlertCircle className="shrink-0 mt-0.5 text-amber-500" size={16} />
                  <span>
                    Ada <strong>{Object.keys(errors).length} isian</strong> yang belum lengkap. Periksa kembali bagian yang ditandai merah di atas.
                  </span>
                </div>
              )}

              {submitError && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
                  <AlertCircle className="shrink-0 mt-0.5" size={16} />
                  <span>{submitError}</span>
                </div>
              )}

              <SubmitBar isLoading={isLoading} />

            </div>
          </form>
        </div>
      </main>
      <Subs />
    </div>
  );
}

