"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Compass, Eye, EyeOff, ArrowLeft } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/trips";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn.email({
        email,
        password,
      });

      if (res.error) {
        setError(res.error.message || "Email atau password salah");
      } else {
        router.push(redirect);
        router.refresh();
      }
    } catch {
      setError("Email atau password salah");
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
            src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80"
            alt="Diving Explorer Scenery"
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
              Jelajahi Lebih Jauh.<br />Kenangan Lebih Lama.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              Dari trip singkat akhir pekan sampai petualangan panjang, temukan semuanya lewat satu platform.
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
          <div className="space-y-2 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Selamat Datang Kembali!
            </h1>
            <p className="text-sm text-slate-500">
              Masuk untuk mulai merencanakan trip berikutnya.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="Masukkan email kamu"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-hidden focus:border-[#e06d26] focus:ring-2 focus:ring-orange-500/20 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password kamu"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-hidden focus:border-[#e06d26] focus:ring-2 focus:ring-orange-500/20 transition pr-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Checkbox & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#e06d26] focus:ring-[#e06d26]"
                />
                <span>Ingat saya</span>
              </label>
              <a href="#" className="font-semibold text-[#e06d26] hover:underline">
                Lupa Password?
              </a>
            </div>

            {error && (
              <div className="rounded-2xl bg-red-50 p-3 text-xs text-red-600 border border-red-100 font-medium">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#e06d26] py-3.5 text-white font-semibold shadow-lg shadow-orange-500/25 hover:bg-[#c85b18] active:scale-98 transition duration-200 disabled:opacity-50 text-sm"
            >
              {loading ? "Memproses..." : "Login"}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-xs text-slate-400 shrink-0 font-medium">
                Atau lanjutkan dengan
              </span>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              className="w-full rounded-2xl border border-slate-200 py-3 flex items-center justify-center gap-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Masuk dengan Google</span>
            </button>
          </form>

          {/* Switch to Register */}
          <div className="mt-8 text-center text-xs text-slate-500">
            Belum punya akun?{" "}
            <Link href="/auth/register" className="font-bold text-slate-900 hover:text-[#e06d26] underline">
              Daftar di sini
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">Memuat...</div>}>
      <LoginForm />
    </Suspense>
  );
}
