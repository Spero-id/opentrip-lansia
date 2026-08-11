"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/private/PageHeader";
import BookingInformationSection from "@/components/private/BookingInformationSection";
import TripDetailSection from "@/components/private/TripDetailSection";
import TripOptionSection from "@/components/private/TripOptionSection";
import TripFromSection from "@/components/private/TripFromSection";
import SuccessState from "@/components/private/SuccessState";
import SubmitBar from "@/components/private/SubmitBar";
import TermsModal from "@/components/private/TermsModal";
import Subs from "@/components/landing/Subs";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import { initialForm } from "@/components/private/helpers/initialState";
import { validate } from "@/components/private/helpers/validation";

/**
 * Builds the `destinationPreferences` text field from all form fields that
 * have no dedicated column in private_trip_requests.
 */
function buildDestinationPreferences(form) {
  const lines = [];

  // Booker info
  lines.push(`[Pemesan]`);
  lines.push(`Nama: ${form.nama}`);
  if (form.phone) lines.push(`Ponsel: ${form.phone}`);
  if (form.email) lines.push(`Email: ${form.email}`);

  // Trip details
  lines.push(`[Detail Perjalanan]`);
  if (form.tanggal) lines.push(`Tanggal Keberangkatan: ${form.tanggal}`);
  if (form.meetingPoint) lines.push(`Meeting Point: ${form.meetingPoint}`);

  // Booking source
  lines.push(`[Asal Pemesanan]`);
  lines.push(`Tipe: ${form.tripFrom}`);
  if (form.tripFrom !== "Individu" && form.namaInstitusi)
    lines.push(`Institusi: ${form.namaInstitusi}`);

  // Participants
  lines.push(`[Peserta]`);
  lines.push(`Jumlah Peserta: ${form.jumlahPeserta || 1} orang`);

  return lines.join("\n");
}

/**
 * Maps the local form state to the payload expected by
 * POST /api/private-trips  (privateTripController.create)
 */
function buildPayload(form, budgetValue) {
  const title =
    form.tripType === "custom"
      ? (form.customTripName.trim() || "Custom Trip")
      : (form.selectedDestinasi?.name || form.selectedDestinasi?.title || "Trip Explorer");

  const participantsCount = parseInt(form.jumlahPeserta, 10);
  const durationDays = parseInt(form.durasi, 10);

  return {
    title,
    durationDays: isNaN(durationDays) || durationDays < 1 ? 1 : durationDays,
    participantsCount: isNaN(participantsCount) ? 6 : participantsCount,
    destinationPreferences: buildDestinationPreferences(form),
    specialRequirements: form.catatan?.trim() || undefined,
    budgetEstimate: budgetValue ? String(budgetValue) : undefined,
  };
}

export default function PrivateTripPage() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showTerms, setShowTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    async function fetchDestinations() {
      try {
        const res = await fetch("/api/trips");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const active = data.filter((item) => item.status === "published");
            const normalized = active.map((item) => ({
              ...item,
              title: item.title || item.name,
              image: item.image || null,
              isSeniorFriendly: item.isSeniorFriendly ?? false,
              priceMin: item.priceMin ?? 0,
              priceMax: item.priceMax ?? 0,
              location: item.location || "Indonesia",
              rating: item.rating ?? 5.0,
            }));
            setDestinations(normalized);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data destinasi dari database:", err);
      }
    }
    fetchDestinations();
  }, []);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitError(null);
    setShowTerms(true);
  };

  const handleAgree = async () => {
    setShowTerms(false);
    setIsLoading(true);
    setSubmitError(null);

    try {
      const payload = buildPayload(form, budgetValue);
      const res = await fetch("/api/private-trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message =
          res.status === 401
            ? "Anda harus login untuk mengirim request."
            : data?.error || data?.errors?.[0]?.message || "Terjadi kesalahan. Silakan coba lagi.";
        setSubmitError(message);
        return;
      }

      const responseData = await res.json().catch(() => ({}));
      setRequestId(responseData.id || null);
      setSubmitted(true);
    } catch {
      setSubmitError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setRequestId(null);
    setErrors({});
    setSubmitError(null);
    setForm(initialForm);
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
      <Navbar />

      {showTerms && (
        <TermsModal
          onAgree={handleAgree}
          onClose={() => setShowTerms(false)}
        />
      )}

      <main className="min-h-screen bg-white">

        <PageHeader />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-0">
          <a
            href="/my-trips"
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-[#F49D1A]/30 bg-[#F49D1A]/5 hover:bg-[#F49D1A]/10 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-[#F49D1A]/15 flex items-center justify-center shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F49D1A" strokeWidth="2.5">
                  <path d="M9 12h6M12 9v6"/><circle cx="12" cy="12" r="9"/>
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-800">Sudah pernah mengajukan request?</p>
                <p className="text-xs text-gray-500">Pantau status dan lihat proposal dari admin</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-[#F49D1A] group-hover:translate-x-0.5 transition-transform shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </a>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                budgetValue={budgetValue}
              />
              <TripOptionSection
                form={form}
                set={set}
                errors={errors}
                destinationsData={destinations}
              />
              <TripFromSection
                form={form}
                set={set}
                errors={errors}
              />

              {submitError && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
                  <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>{submitError}</span>
                </div>
              )}

              <SubmitBar isLoading={isLoading} />

            </div>
          </form>
        </div>
      </main>
      <Subs />
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

