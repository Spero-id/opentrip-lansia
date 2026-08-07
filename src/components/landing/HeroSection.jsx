"use client";

import { MapPin, Calendar, Search, ArrowRight, TrendingUp, Users, Award } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const stats = [
  { icon: MapPin, value: "500+", label: "Destinasi" },
  { icon: Users, value: "10Rb+", label: "Traveler" },
  { icon: Award, value: "100%", label: "Terpercaya" },
];

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const rafRef = useRef(null);
  useEffect(() => {
    rafRef.current = requestAnimationFrame(() => setMounted(true));
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <section
      id="beranda"
      className="relative overflow-hidden bg-cover bg-center min-h-[90vh] flex items-center"
      style={{
        backgroundImage: "url('/hero-image-2.jpeg')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

      <div className="absolute top-20 left-10 w-72 h-72 bg-[#F49D1A]/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#1CA6B7]/10 rounded-full blur-[120px] animate-pulse delay-1000" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-[1fr_0.85fr] gap-12 items-center">
          <div className={`space-y-8 transition-all duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
              Jelajahi{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F49D1A] to-[#F7931A]">
                Nusantara
              </span>
              <br />
              Ciptakan{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1CA6B7] to-[#20B2AA]">
                Memori
              </span>
            </h1>

            <p className="text-white/70 text-lg max-w-lg leading-relaxed">
              Temukan pengalaman perjalanan tak terlupakan dengan harga terbaik. Dari Sabang sampai Merauke, kami siap antar kamu.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="flex-1 flex items-center gap-3 bg-white backdrop-blur-md rounded-2xl px-5 py-3.5 border border-white/20">
                <Search size={18} className="text-[#F49D1A] shrink-0" />
                <input
                  type="text"
                  placeholder="Cari destinasi impianmu..."
                  className="bg-transparent text-sm text-black placeholder:text-gray-400 w-full focus:outline-none"
                />
              </div>
              <Link
                href="/trips"
                className="inline-flex items-center justify-center gap-2 bg-[#F49D1A] hover:bg-[#c47d12] text-white px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:shadow-lg hover:shadow-[#F49D1A]/25 whitespace-nowrap"
              >
                Jelajahi
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-white/10 backdrop-blur-sm">
                <MapPin size={14} className="text-[#F49D1A]" />
                <span className="text-xs text-black">Semua Destinasi</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-white/10 backdrop-blur-sm">
                <Calendar size={14} className="text-[#F49D1A]" />
                <span className="text-xs text-black">Fleksibel Jadwal</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-white/10 backdrop-blur-sm">
                <Users size={14} className="text-[#F49D1A]" />
                <span className="text-xs text-black">Ramah Lansia</span>
              </div>
            </div>

          </div>

          <div className={`relative hidden lg:block transition-all duration-700 delay-300 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <div className="grid grid-cols-2 gap-4 items-stretch">
              <div className="rounded-3xl overflow-hidden shadow-2xl relative group h-[280px]">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=500&fit=crop"
                  alt="Hot air balloon"
                  width={400}
                  height={500}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="rounded-3xl overflow-hidden shadow-2xl group h-[280px]">
                <img
                  src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=350&fit=crop"
                  alt="Tropical bridge"
                  width={400}
                  height={350}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="rounded-3xl overflow-hidden shadow-2xl relative group h-[280px]">
                <img
                  src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=350&fit=crop"
                  alt="Beach walk"
                  width={400}
                  height={350}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="rounded-3xl overflow-hidden shadow-2xl group h-[280px]">
                <img
                  src="https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&h=500&fit=crop"
                  alt="Ocean view"
                  width={400}
                  height={500}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
            </div>

            <div className="relative mt-4 w-full bg-white backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F49D1A]/20 flex items-center justify-center">
                  <Users size={18} className="text-[#F49D1A]" />
                </div>
                <div>
                  <p className="text-black text-sm font-semibold">10rb+ Traveler</p>
                  <p className="text-black/70 text-xs">Sudah percaya kami</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}