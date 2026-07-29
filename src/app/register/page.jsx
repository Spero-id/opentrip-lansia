"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="fixed inset-0 overflow-hidden lg:static lg:h-auto lg:min-h-screen bg-white flex flex-col lg:flex lg:items-center lg:justify-center lg:p-4">
            <div className="flex flex-col flex-1 min-h-0 lg:min-h-0 lg:flex-none w-full max-w-6xl lg:grid lg:grid-cols-2 lg:rounded-2xl overflow-hidden lg:shadow-2xl">

                <div
                    className="order-1 lg:order-1 shrink-0 relative flex flex-col justify-between p-6 lg:p-10 h-56 lg:min-h-[650px] lg:h-auto bg-cover bg-center"
                    style={{
                        backgroundImage: "url('/register-page-image.jpeg')",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/70" />

                    <Link
                        href="/"
                        className="relative z-10 flex items-center gap-2 text-[#df7224] font-bold text-lg"
                    >
                        <img src="/Jelajah-Memoria-01.png" alt="Jelajah Memoria" className="h-10 w-auto" />
                    </Link>

                    <div className="relative z-10">
                        <h2 className="text-xl lg:text-3xl hidden sm:block font-bold text-white leading-snug mb-1 lg:mb-3">
                            Mulai Petualanganmu. <br className="hidden lg:block" /> Satu Langkah Lagi.
                        </h2>
                        <p className="hidden lg:block text-white/70 text-sm max-w-sm">
                            Daftar sekarang dan temukan destinasi impian dengan pengalaman tak terlupakan.
                        </p>
                    </div>
                </div>

                <div className="order-2 lg:order-2 relative -mt-8 lg:mt-0 flex-1 min-h-0 overflow-y-auto bg-white rounded-t-[2.5rem] lg:rounded-none p-6 sm:p-10 flex flex-col justify-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <Link
                        href="/"
                        className="hidden lg:inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors mb-8 self-start"
                    >
                        <ArrowLeft size={14} />
                        Kembali ke Website
                    </Link>

                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 pt-30 sm:pt-0 mb-2">
                        Buat Akun Baru
                    </h1>
                    <p className="text-gray-500 text-sm mb-8">
                        Daftar untuk mulai merencanakan trip berikutnya.
                    </p>

                    <form className="space-y-3 sm:space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                placeholder="Masukkan Username kamu"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#df7224]/20 focus:border-[#df7224] transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="Masukkan email kamu"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#df7224]/20 focus:border-[#df7224] transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Masukkan password kamu"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#df7224]/20 focus:border-[#df7224] transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-[#df7224] focus:ring-[#df7224]/30"
                                />
                                Saya setuju dengan Syarat & Ketentuan
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#df7224] text-white py-3.5 rounded-xl font-semibold hover:bg-[#df7224]/80 transition-colors"
                        >
                            Daftar
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-3 sm:my-4">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[13px] text-gray-400">Atau lanjutkan dengan</span>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24">
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
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Daftar dengan Google
                    </button>

                    <p className="text-center text-sm text-gray-500 mt-4 sm:mt-8">
                        Sudah Punya AKun?{" "}
                        <a href="/login" className="italic text-gray-900 font-semibold hover:text-[#df7224]">
                            Masuk disini
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
