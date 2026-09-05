"use client";

import { useState, useRef } from "react";
import { ArrowRight, Loader2, Phone, Mail, MapPin, Send, User } from "lucide-react";

// Tautan Google Maps untuk alamat pada panel "Hubungi Kami".
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    "Jl. Ratu Bidadari 3 No. 2, Ciputat, Tangerang Selatan"
)}`;

// Kartu Telepon di panel "Hubungi Kami" langsung membuka chat WhatsApp.
const WA_NUMBER = "6285110511403";
const WA_MESSAGE =
    process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
    "Halo Abangkuh, saya ingin bertanya tentang trip di Jelajah Memoria";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Subs from "@/components/landing/Subs";
import { A, A_HOVER, baseInput, normalBorder } from "@/lib/design-tokens";

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const formRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(formRef.current);
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone") || null,
            message: formData.get("message"),
        };

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const body = await res.json();
                throw new Error(body.error || "Gagal mengirim pesan");
            }

            setSubmitted(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white">
            <Navbar />

            <section
                className="relative bg-cover bg-center py-24 sm:py-40"
                style={{ backgroundImage: "url('/contact-hero.jpg')" }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                        Contact <span className="text-[#F49D1A]">Us</span>
                    </h1>
                </div>

                <div
                    className="absolute bottom-0 left-0 right-0 h-16 bg-white"
                    style={{
                        clipPath: "polygon(0 100%, 100% 100%, 70% 10%, 50% 0, 10% 100%, 0 0)",
                    }}
                />
            </section>

            <section className="relative z-20 -mt-24 sm:-mt-32 pb-16 sm:pb-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl overflow-hidden">
                        <div className="grid lg:grid-cols-5">
                            <div
                                className="lg:col-span-2 relative bg-cover bg-center p-8 sm:p-10 flex flex-col justify-between overflow-hidden"
                                style={{
                                    backgroundImage: "url('/contact-panel-image.jpg')",
                                }}
                            >
                                <div className="absolute inset-0 bg-gray-900" />

                                <div className="relative">
                                    <h2 className="text-2xl font-bold text-white mb-3">Hubungi Kami</h2>
                                    <p className="text-white/60 text-sm leading-relaxed mb-10 max-w-sm">
                                        Tim kami siap bantu kamu lewat kontak di bawah ini, atau
                                        langsung datang ke lokasi kantor kami.
                                    </p>

                                    <ul className="space-y-8">
                                        <li className="flex items-start gap-4">
                                            <Phone className="w-4 h-4 text-[#F49D1A] shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-white/50">Telepon</p>
                                                <a
                                                    href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-normal text-white hover:underline underline-offset-2 decoration-white/60"
                                                >
                                                    +62 851-1051-1403
                                                </a>
                                            </div>
                                        </li>

                                        <li className="flex items-start gap-4">
                                            <Mail className="w-4 h-4 text-[#F49D1A] shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-white/50">Email</p>
                                                <a
                                                    href="https://mail.google.com/mail/?view=cm&fs=1&to=jelajahmemoria@gmail.com"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-normal text-white hover:underline underline-offset-2 decoration-white/60"
                                                >
                                                    jelajahmemoria@gmail.com
                                                </a>
                                            </div>
                                        </li>

                                        <li className="flex items-start gap-4">
                                            <MapPin className="w-4 h-4 text-[#F49D1A] shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-white/50">Alamat</p>
                                                <a
                                                    href={MAPS_URL}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-normal text-white leading-relaxed max-w-[240px] hover:underline underline-offset-2 decoration-white/60"
                                                >
                                                    Jl. Ratu Bidadari 3 no 2, Ciputat, Tangerang Selatan
                                                </a>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="lg:col-span-3 p-8 sm:p-10">
                                <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2A37] mb-3">
                                    Get In Touch
                                </h2>
                                <p className="text-[#6B7280] text-sm leading-relaxed mb-8 max-w-md">
                                    Isi form di bawah dan tim kami akan segera menghubungi kamu kembali,
                                    biasanya dalam 1x24 jam kerja.
                                </p>

                                {submitted ? (
                                    <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-[#E5E7EB] rounded-xl">
                                        <div className="w-14 h-14 rounded-full bg-[#F49D1A]/10 flex items-center justify-center mb-4">
                                            <Send className="w-5 h-5 text-[#F49D1A]" />
                                        </div>
                                        <h3 className="font-bold text-[#1F2A37] mb-1">Pesan terkirim!</h3>
                                        <p className="text-sm text-[#6B7280] max-w-xs">
                                            Terima kasih, tim kami akan segera menghubungi kamu kembali.
                                        </p>
                                    </div>
                                ) : (
                                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-[13px] font-medium text-[#374151] mb-2">
                                                    Email
                                                </label>
                                                <div className="relative">
                                                    <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        placeholder="Cth: budi@email.com"
                                                        required
                                                        className={`${baseInput} pl-11 pr-4 text-[#1F2A37] ${normalBorder}`}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-medium text-[#374151] mb-2">
                                                    Telepon
                                                </label>
                                                <div className="relative">
                                                    <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        placeholder="081234567890"
                                                        className={`${baseInput} pl-11 pr-4 text-[#1F2A37] ${normalBorder}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[13px] font-medium text-[#374151] mb-2">
                                                Nama Lengkap
                                            </label>
                                            <div className="relative">
                                                <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    placeholder="Cth: Budi Santoso"
                                                    required
                                                    className={`${baseInput} pl-11 pr-4 text-[#1F2A37] ${normalBorder}`}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[13px] font-medium text-[#374151] mb-2">
                                                Pesan
                                            </label>
                                            <textarea
                                                rows={5}
                                                name="message"
                                                placeholder="Tulis pesan kamu di sini..."
                                                required
                                                className={`${baseInput} text-[#1F2A37] resize-none ${normalBorder}`}
                                            />
                                        </div>

                                        {error && (
                                            <p className="text-sm text-red-500 bg-red-50 border border-red-300 rounded-lg px-4 py-3">
                                                {error}
                                            </p>
                                        )}

                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                style={{ backgroundColor: A }}
                                                onMouseEnter={(e) => {
                                                    if (!loading) e.currentTarget.style.backgroundColor = A_HOVER;
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!loading) e.currentTarget.style.backgroundColor = A;
                                                }}
                                                className="px-6 py-3 rounded-lg text-white font-semibold text-[13px] tracking-wide transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-sm"
                                            >
                                                {loading ? "Mengirim..." : "Kirim Pesan"}
                                                {loading ? (
                                                    <Loader2 size={14} strokeWidth={2.5} className="animate-spin" />
                                                ) : (
                                                    <ArrowRight size={14} strokeWidth={2.2} />
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Subs />
            <Footer />
        </div>
    );
}
