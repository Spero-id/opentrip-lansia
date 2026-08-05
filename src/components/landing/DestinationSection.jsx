"use client";

import { useRef, useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import DestinationCard from "@/components/destinasi/DestinationCard";

const FALLBACK_IMAGES = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQw8p4vVW46w8v2EDTYS5ZN08gcBlEyL2Hq2n-oDk588w&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4HXrHCu5wU0hTKdf2vfJj5ZiXuH3LEUeh5s2vEDS6mYWKlFLeAP91yNQ&s=10",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
  "https://images.unsplash.com/photo-1522770179533-24471fcdba45?w=600&q=80",
];

const DEFAULT_RATING = 5.0;

function toCard(dest, index) {
  const image =
    dest.image ||
    (Array.isArray(dest.images) && dest.images[0]) ||
    FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

  return {
    id: dest.id,
    title: dest.name,
    location: dest.location || "Indonesia",
    rating: dest.rating || DEFAULT_RATING,
    priceMin: dest.priceMin || 0,
    category: dest.category || dest.categoryName || (dest.categoryId ? "Budaya" : "Alam"),
    isSeniorFriendly: dest.isSeniorFriendly !== undefined ? dest.isSeniorFriendly : (dest.difficultyLevel === "mudah" || !dest.difficultyLevel),

    image,
  };
}

export default function DestinationSection() {
  const scrollRef = useRef(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  function handleCardClick(e, id) {
    if (isLoggedIn) return;
    e.preventDefault();
    router.push(`/login?redirect=/trips/${id}`);
  }

  useEffect(() => {
    fetch("/api/destinations")
      .then((res) => res.json())
      .then((data) => {
        const active = Array.isArray(data)
          ? data.filter((d) => d.isActive !== false)
          : [];
        setDestinations(active.map(toCard));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section id="destinasi" className="relative bg-white py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 md:mb-10">
          <div>
            <p className="text-[#F49D1A] font-semibold text-sm tracking-wide mb-3">
              DESTINASI PILIHAN
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
              Destinasi Paling <span className="text-[#F49D1A]">Diminati</span>
            </h2>
          </div>

          <Link
            href="/trips"
            className="hidden md:flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-[#F49D1A] transition-colors shrink-0"
          >
            Lihat semua
            <ArrowRight size={16} className="rotate-[-45deg]" />
          </Link>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex md:grid md:grid-cols-4 md:grid-rows-2 md:max-w-6xl md:mx-auto gap-5 overflow-x-auto md:overflow-visible scroll-smooth snap-x snap-mandatory px-4 sm:px-6 md:px-6 lg:px-8 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {destinations.slice(0, 8).map((dest) => (
          <DestinationCard
            key={dest.id}
            dest={dest}
            onClick={(e) => handleCardClick(e, dest.id)}
            className="snap-start shrink-0 w-[280px] sm:w-[320px] md:w-auto"
          />
        ))}

        <div className="shrink-0 w-1 md:hidden" />
      </div>

      {!loading && destinations.length === 0 && (
        <p className="text-center text-sm text-gray-400 pt-2 pb-6">
          Belum ada destinasi. Tambahkan dulu lewat halaman admin.
        </p>
      )}

      <div className="flex md:hidden items-center justify-center gap-2 mt-6">
        <button
          onClick={() => scroll("left")}
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => scroll("right")}
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
