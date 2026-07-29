"use client";

import { useState } from "react";
import {
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    ClockIcon,
    PaperAirplaneIcon,
    UserIcon,
    ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Subs from "@/components/landing/Subs";

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
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
                        Contact <span className="text-[#df7224]">Us</span>
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
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
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

                                    <div className="space-y-3">
                                        <a
                                            href="tel:+6281234567890"
                                            className="flex items-center gap-4 bg-white/5 hover:bg-white/10 rounded-xl px-4 py-3.5 transition-colors group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-white group-hover:bg-[#df7224] flex items-center justify-center shrink-0 transition-colors">
                                                <PhoneIcon className="w-4 h-4 text-[#df7224] group-hover:text-white transition-colors" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-white/50">Telepon</p>
                                                <p className="text-sm font-semibold text-white">+62 812-3456-7890</p>
                                            </div>
                                        </a>

                                        <a
                                            href="mailto:hello@opentrip.id"
                                            className="flex items-center gap-4 bg-white/5 hover:bg-white/10 rounded-xl px-4 py-3.5 transition-colors group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-white group-hover:bg-[#df7224] flex items-center justify-center shrink-0 transition-colors">
                                                <EnvelopeIcon className="w-4 h-4 text-[#df7224] group-hover:text-white transition-colors" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-white/50">Email</p>
                                                <p className="text-sm font-semibold text-white">hello@opentrip.id</p>
                                            </div>
                                        </a>

                                        <div className="flex items-center gap-4 bg-white/5 rounded-xl px-4 py-3.5">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                                                <MapPinIcon className="w-4 h-4 text-[#df7224]" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-white/50">Alamat</p>
                                                <p className="text-sm font-semibold text-white">Jl. Merdeka No. 10, Bandung, Jawa Barat</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 bg-white/5 rounded-xl px-4 py-3.5">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                                                <ClockIcon className="w-4 h-4 text-[#df7224]" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-white/50">Jam Operasional</p>
                                                <p className="text-sm font-semibold text-white">Senin – Sabtu, 09.00 – 18.00</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-3 p-8 sm:p-10">
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                                    Get In Touch
                                </h2>
                                <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-md">
                                    Isi form di bawah dan tim kami akan segera menghubungi kamu kembali,
                                    biasanya dalam 1x24 jam kerja.
                                </p>

                                {submitted ? (
                                    <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-gray-200 rounded-xl">
                                        <div className="w-14 h-14 rounded-full bg-[#df7224]/10 flex items-center justify-center mb-4">
                                            <PaperAirplaneIcon className="w-5 h-5 text-[#df7224]" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-1">Pesan terkirim!</h3>
                                        <p className="text-sm text-gray-500 max-w-xs">
                                            Terima kasih, tim kami akan segera menghubungi kamu kembali.
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email
                                                </label>
                                                <div className="relative">
                                                    <EnvelopeIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="email"
                                                        placeholder="nama@email.com"
                                                        required
                                                        className="w-full border border-gray-200 rounded-lg pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#df7224]/20 focus:border-[#df7224] transition-colors"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Phone
                                                </label>
                                                <div className="relative">
                                                    <PhoneIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="tel"
                                                        placeholder="08xx-xxxx-xxxx"
                                                        className="w-full border border-gray-200 rounded-lg pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#df7224]/20 focus:border-[#df7224] transition-colors"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Name
                                            </label>
                                            <div className="relative">
                                                <UserIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Nama lengkap"
                                                    required
                                                    className="w-full border border-gray-200 rounded-lg pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#df7224]/20 focus:border-[#df7224] transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Message
                                            </label>
                                            <div className="relative">
                                                <ChatBubbleLeftRightIcon className="w-4 h-4 absolute left-4 top-4 text-gray-400" />
                                                <textarea
                                                    rows={5}
                                                    placeholder="Tulis pesan kamu di sini..."
                                                    required
                                                    className="w-full border border-gray-200 rounded-lg pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#df7224]/20 focus:border-[#df7224] transition-colors resize-none"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="flex items-center justify-center gap-2 bg-[#df7224] text-white px-8 py-3.5 w-full rounded-lg font-semibold hover:bg-[#c3611c] transition-colors"
                                        >
                                            Kirim Pesan
                                            <PaperAirplaneIcon className="w-4 h-4" />
                                        </button>
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
