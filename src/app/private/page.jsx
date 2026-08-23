"use client";

import { useState, useEffect } from "react";
import { Clock, ChevronRight, AlertCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/private/PageHeader";
import BookingInformationSection from "@/components/private/BookingInformationSection";
import TripDetailSection from "@/components/private/TripDetailSection";
import FacilitiesSection from "@/components/private/FacilitiesSection";
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
  lines.push(`Tipe Trip: ${form.tripType === "custom" ? "Destinasi Baru (Custom)" : "Modifikasi Paket Web"}`);
  if (form.tripType === "custom" && form.customTripName) lines.push(`Tujuan: ${form.customTripName}`);
  if (form.tripType === "explorer" && form.selectedDestinasi) lines.push(`Paket Referensi: ${form.selectedDestinasi.title || form.selectedDestinasi.name}`);
  lines.push(`Jumlah Peserta: ${form.jumlahPeserta || 1} orang`);
  lines.push(`Durasi: ${form.durasi || "-"} hari`);
  if (form.tanggalFleksibel) lines.push(`Tanggal Keberangkatan: Fleksibel`);
  else if (form.tanggal) lines.push(`Tanggal Keberangkatan: ${form.tanggal}`);
  if (form.meetingPoint) lines.push(`Meeting Point: ${form.meetingPoint}`);
  if (form.transportNeeds) {
    const map = { "all-in": "All-in dari Kota Asal", local: "Transportasi Lokal Saja", self: "Bawa Kendaraan Sendiri" };
    lines.push(`Transportasi: ${map[form.transportNeeds] || form.transportNeeds}`);
  }

  // Fasilitas & Preferensi
  lines.push(`[Fasilitas & Budget]`);
  if (form.standarPenginapan) {
    const sm = { budget: "Budget / Homestay", bintang3: "Hotel Bintang 3", bintang4: "Hotel Bintang 4", bintang5: "Hotel Bintang 5", villa: "Villa / Resort" };
    lines.push(`Standar Penginapan: ${sm[form.standarPenginapan] || form.standarPenginapan}`);
  }
  if (form.layananTambahan && form.layananTambahan.length > 0) {
    const lm = { fotografer: "Fotografer / Video", drone: "Kamera Drone", gala: "Gala Dinner / BBQ", tourLeader: "Tour Leader Khusus" };
    lines.push(`Layanan Tambahan: ${form.layananTambahan.map((k) => lm[k] || k).join(", ")}`);
  }
  if (form.catatan) lines.push(`Catatan Khusus: ${form.catatan}`);
  if (form.budget) lines.push(`Estimasi Budget: Rp ${form.budget} /orang`);
  if (form.metodeKontak) lines.push(`Metode Tindak Lanjut: ${form.metodeKontak === "whatsapp" ? "Hubungi via WhatsApp" : "Kirim ke Email"}`);

  // Booking source
  lines.push(`[Asal Pemesanan]`);
  lines.push(`Tipe: ${form.tripFrom}`);
  if (form.tripFrom !== "Individu" && form.namaInstitusi)
    lines.push(`Institusi: ${form.namaInstitusi}`);

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
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

