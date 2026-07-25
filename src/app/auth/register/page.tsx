"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { Compass, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signUp.email({
        email: form.email,
        password: form.password,
        name: form.fullName,
      });

      if (res.error) {
        setError(res.error.message || "Gagal mendaftar");
      } else {
        router.push("/trips");
        router.refresh();
      }
    } catch {
      setError("Gagal mendaftar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      
      {/* Outer Card Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-100 min-h-[640px]">
        
        {/* Left Column: Full-Bleed Travel Photo Banner */}
        <div className="lg:col-span-6 relative hidden lg:flex flex-col justify-between p-10 text-white overflow-hidden bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80"
            alt="Beach Travel Scenery"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-slate-900/60" />

          {/* Brand logo overlay */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
              <Compass className="h-7 w-7 text-[#e06d26]" />
              <span>Open<span className="text-[#e06d26]">Trip</span></span>
            </Link>
          </div>

          {/* Tagline text overlay */}
          <div className="relative z-10 space-y-3">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
              Bergabunglah Sekarang.<br />Mulai Petualangan Barumu.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              Buat akun OpenTrip secara gratis dan rasakan kemudahan merencanakan trip impian ke berbagai destinasi eksotis.
            </p>
          </div>
        </div>

        {/* Right Column: Form Container */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between bg-white">
          
          {/* Back link */}
          <div className="flex justify-end mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-[#e06d26] transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Website</span>
            </Link>
          </div>

          {/* Form Header */}
          <div className="space-y-2 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Buat Akun Baru
            </h1>
            <p className="text-sm text-slate-500">
              Isi data di bawah untuk mendaftar akun OpenTrip Anda.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                placeholder="Masukkan nama lengkap kamu"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-hidden focus:border-[#e06d26] focus:ring-2 focus:ring-orange-500/20 transition"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="Masukkan email kamu"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-hidden focus:border-[#e06d26] focus:ring-2 focus:ring-orange-500/20 transition"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Buat password aman"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-hidden focus:border-[#e06d26] focus:ring-2 focus:ring-orange-500/20 transition pr-11"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl bg-red-50 p-3 text-xs text-red-600 border border-red-100 font-medium">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#e06d26] py-3.5 text-white font-semibold shadow-lg shadow-orange-500/25 hover:bg-[#c85b18] active:scale-98 transition duration-200 disabled:opacity-50 text-sm mt-2"
            >
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-8 text-center text-xs text-slate-500">
            Sudah punya akun?{" "}
            <Link href="/auth/login" className="font-bold text-slate-900 hover:text-[#e06d26] underline">
              Masuk di sini
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
