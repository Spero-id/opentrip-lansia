"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { ArrowRight, Route, ShieldCheck, SendHorizonal, AlertCircle } from "lucide-react";

interface FormData {
  title: string;
  durationDays: number;
  participantsCount: number;
  destinationPreferences: string;
  specialRequirements: string;
  budgetEstimate: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function PrivateTripPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [form, setForm] = useState<FormData>({
    title: "",
    durationDays: 3,
    participantsCount: 2,
    destinationPreferences: "",
    specialRequirements: "",
    budgetEstimate: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  function validate(): ValidationErrors {
    const errs: ValidationErrors = {};
    if (!form.title.trim()) errs.title = "Judul perjalanan wajib diisi";
    if (!form.durationDays || form.durationDays < 1) errs.durationDays = "Durasi minimal 1 hari";
    if (!form.participantsCount || form.participantsCount < 1) errs.participantsCount = "Peserta minimal 1 orang";
    if (!form.destinationPreferences.trim()) errs.destinationPreferences = "Destinasi yang diinginkan wajib diisi";
    if (form.budgetEstimate) {
      const num = Number(form.budgetEstimate.replace(/[^0-9]/g, ""));
      if (isNaN(num) || num < 0) errs.budgetEstimate = "Nominal anggaran tidak valid";
    }
    return errs;
  }

  function formatRupiah(value: string) {
    const num = value.replace(/[^0-9]/g, "");
    if (!num) return "";
    return new Intl.NumberFormat("id-ID").format(Number(num));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError("");

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    if (!session?.user) {
      router.push("/auth/login?redirect=/private-trip");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/private-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          budgetEstimate: form.budgetEstimate ? String(Number(form.budgetEstimate.replace(/[^0-9]/g, ""))) : "",
        }),
      });

      if (res.status === 401) {
        router.push("/auth/login?redirect=/private-trip");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        if (data.errors) {
          const fieldErrors: ValidationErrors = {};
          data.errors.forEach((err: { field: string; message: string }) => { fieldErrors[err.field] = err.message; });
          setErrors(fieldErrors);
        } else {
          setApiError(data.error || "Terjadi kesalahan. Silakan coba lagi.");
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/profile?tab=private-trip"), 1500);
    } catch {
      setApiError("Gagal terhubung ke server. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50/40 via-white to-white px-4">
        <div className="text-center max-w-md space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <SendHorizonal className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Request Terkirim!</h1>
          <p className="text-slate-600">Tim kami akan meninjau request Anda dan mengirimkan proposal melalui dashboard akun Anda.</p>
          <div className="animate-pulse w-8 h-8 border-4 border-[#e06d26] border-t-transparent rounded-full mx-auto" />
          <p className="text-xs text-slate-400">Mengalihkan ke profil Anda...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50/40 via-white to-white">
      {/* Header */}
      <section className="relative pt-16 pb-10 md:pt-20 md:pb-14 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-semibold text-[#e06d26] mb-4">
            <Route className="w-3.5 h-3.5" />
            <span>PRIVATE TRIP</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            Rencanakan{" "}
            <span className="text-[#e06d26]">Perjalanan Anda</span>
          </h1>
          <p className="mt-3 text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Isi form di bawah untuk memulai. Tim kami akan meninjau dan memberikan proposal harga terbaik untuk perjalanan rombongan Anda.
          </p>
        </div>
      </section>

      {/* Info cards */}
      <section className="pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: ShieldCheck, title: "Ditinjau Admin", desc: "Request Anda akan diperiksa oleh tim kami" },
              { icon: ArrowRight, title: "Proposal Harga", desc: "Harga final diberikan melalui proposal" },
              { icon: Route, title: "Belum Booking", desc: "Request ini belum merupakan pemesanan/pembayaran" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#e06d26] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="pb-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
            {apiError && (
              <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-1">
                  Judul Perjalanan <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={`w-full rounded-xl border ${errors.title ? "border-red-300 ring-2 ring-red-200" : "border-slate-300 focus:border-[#e06d26] focus:ring-2 focus:ring-[#e06d26]/30"} px-4 py-3 text-sm outline-none transition`}
                  placeholder="Misal: Liburan Keluarga ke Bali"
                  required
                />
                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
              </div>

              {/* Duration & Participants */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="durationDays" className="block text-sm font-bold text-slate-700 mb-1">
                    Durasi (Hari) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="durationDays"
                    type="number"
                    value={form.durationDays}
                    onChange={(e) => setForm({ ...form, durationDays: Math.max(1, Number(e.target.value)) })}
                    className={`w-full rounded-xl border ${errors.durationDays ? "border-red-300 ring-2 ring-red-200" : "border-slate-300 focus:border-[#e06d26] focus:ring-2 focus:ring-[#e06d26]/30"} px-4 py-3 text-sm outline-none transition`}
                    min={1}
                    required
                  />
                  {errors.durationDays && <p className="mt-1 text-xs text-red-600">{errors.durationDays}</p>}
                </div>
                <div>
                  <label htmlFor="participantsCount" className="block text-sm font-bold text-slate-700 mb-1">
                    Jumlah Peserta <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="participantsCount"
                    type="number"
                    value={form.participantsCount}
                    onChange={(e) => setForm({ ...form, participantsCount: Math.max(1, Number(e.target.value)) })}
                    className={`w-full rounded-xl border ${errors.participantsCount ? "border-red-300 ring-2 ring-red-200" : "border-slate-300 focus:border-[#e06d26] focus:ring-2 focus:ring-[#e06d26]/30"} px-4 py-3 text-sm outline-none transition`}
                    min={1}
                    required
                  />
                  {errors.participantsCount && <p className="mt-1 text-xs text-red-600">{errors.participantsCount}</p>}
                </div>
              </div>

              {/* Destination Preferences */}
              <div>
                <label htmlFor="destinationPreferences" className="block text-sm font-bold text-slate-700 mb-1">
                  Destinasi yang Diinginkan <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="destinationPreferences"
                  rows={3}
                  value={form.destinationPreferences}
                  onChange={(e) => setForm({ ...form, destinationPreferences: e.target.value })}
                  className={`w-full rounded-xl border ${errors.destinationPreferences ? "border-red-300 ring-2 ring-red-200" : "border-slate-300 focus:border-[#e06d26] focus:ring-2 focus:ring-[#e06d26]/30"} px-4 py-3 text-sm outline-none transition resize-none`}
                  placeholder="Sebutkan destinasi atau area yang ingin dikunjungi"
                  required
                />
                {errors.destinationPreferences && <p className="mt-1 text-xs text-red-600">{errors.destinationPreferences}</p>}
              </div>

              {/* Budget Estimate */}
              <div>
                <label htmlFor="budgetEstimate" className="block text-sm font-bold text-slate-700 mb-1">
                  Kisaran Anggaran (Opsional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">Rp</span>
                  <input
                    id="budgetEstimate"
                    value={form.budgetEstimate ? formatRupiah(form.budgetEstimate) : ""}
                    onChange={(e) => setForm({ ...form, budgetEstimate: e.target.value })}
                    className={`w-full rounded-xl border ${errors.budgetEstimate ? "border-red-300 ring-2 ring-red-200" : "border-slate-300 focus:border-[#e06d26] focus:ring-2 focus:ring-[#e06d26]/30"} pl-10 pr-4 py-3 text-sm outline-none transition`}
                    placeholder="0"
                  />
                </div>
                {errors.budgetEstimate && <p className="mt-1 text-xs text-red-600">{errors.budgetEstimate}</p>}
              </div>

              {/* Special Requirements */}
              <div>
                <label htmlFor="specialRequirements" className="block text-sm font-bold text-slate-700 mb-1">
                  Kebutuhan Khusus (Opsional)
                </label>
                <textarea
                  id="specialRequirements"
                  rows={3}
                  value={form.specialRequirements}
                  onChange={(e) => setForm({ ...form, specialRequirements: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#e06d26] focus:ring-2 focus:ring-[#e06d26]/30 resize-none"
                  placeholder="Misal: kursi roda, diet khusus, obat-obatan, alergi..."
                  maxLength={2000}
                />
                <p className="mt-1 text-xs text-slate-400 text-right">{form.specialRequirements.length}/2000</p>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#e06d26] hover:bg-[#c85b18] text-white font-bold py-3.5 px-6 text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <span>Ajukan Private Trip</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {!session?.user && (
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-500">
                Anda harus{" "}
                <Link href="/auth/login?redirect=/private-trip" className="text-[#e06d26] font-semibold hover:underline">
                  login
                </Link>{" "}
                untuk mengirim request.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
