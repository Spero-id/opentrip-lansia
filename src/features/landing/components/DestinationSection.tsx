"use client";

import { useRef, useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, MapPin } from "lucide-react";
import Link from "next/link";
import DestinationCard from "@/features/trip/components/DestinationCard";
import { LANDING_PAGE_SIZE, clampLandingPage, fetchLandingTrips } from "@/features/landing/api/client";
import type { TripDetail } from "@/features/trip/types";

const PAGE_SIZE = LANDING_PAGE_SIZE;

export default function DestinationSection() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [destinations, setDestinations] = useState<TripDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(destinations.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleDestinations = destinations.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  function goToPage(nextPage: number) {
    setPage(clampLandingPage(nextPage, pageCount));
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    let cancelled = false;
    fetchLandingTrips().then((data) => {
      if (!cancelled) setDestinations(data);
    }).catch(() => {}).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };


  return (
    <section id="destinasi" className="relative bg-card py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 md:mb-10">
          <div>
            <p className="text-primary-foreground font-semibold text-sm tracking-wide mb-3">
              DESTINASI PILIHAN
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-snug">
              Destinasi Paling <span className="text-primary-foreground">Diminati</span>
            </h2>
          </div>

          <Link
            href="/trips"
            className="hidden md:flex items-center gap-1 text-md font-semibold text-foreground hover:text-primary-foreground transition-colors shrink-0"
          >
            Lihat semua
            <ArrowRight size={24} className="rotate-[-45deg]" />
          </Link>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={`flex md:grid md:max-w-6xl md:mx-auto gap-5 overflow-x-auto md:overflow-visible scroll-smooth snap-x snap-mandatory px-4 sm:px-6 md:px-6 lg:px-8 pb-4 scroll-mt-28 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
          visibleDestinations.length <= 3
            ? "md:grid-cols-3"
            : visibleDestinations.length === 4
            ? "md:grid-cols-4"
            : "md:grid-cols-3 md:grid-rows-2"
        }`}
      >
        {visibleDestinations.map((dest) => (
          <DestinationCard
            key={dest.id}
            dest={dest}
            className="snap-start shrink-0 w-[280px] sm:w-[320px] md:w-auto"
          />
        ))}

        <div className="shrink-0 w-1 md:hidden" />
      </div>

      {!loading && destinations.length === 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6">
          <div className="flex flex-col items-center justify-center py-14 text-center rounded-2xl border border-dashed border-border bg-card">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: "color-mix(in srgb, var(--primary) 8%, transparent)" }}
            >
              <MapPin size={24} style={{ color: "var(--primary-foreground)" }} />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">Belum ada destinasi</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Destinasi menarik akan segera hadir. Pantau terus ya!
            </p>
          </div>
        </div>
      )}

      {destinations.length > PAGE_SIZE && (
        <div
          className={`hidden md:flex items-center justify-center gap-4 ${
            visibleDestinations.length <= 4 ? "mt-2" : "mt-8"
          }`}
        >
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
            aria-label="Muat destinasi sebelumnya"
            className="w-11 h-11 rounded-full border border-border flex items-center justify-center text-muted-foreground transition-colors hover:border-primary hover:text-primary-foreground disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted-foreground"
          >
            <ChevronUp size={20} />
          </button>

          <span className="text-sm font-medium text-muted-foreground tabular-nums">
            {currentPage + 1} / {pageCount}
          </span>

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= pageCount - 1}
            aria-label="Lihat destinasi lainnya"
            className="w-11 h-11 rounded-full border border-border flex items-center justify-center text-muted-foreground transition-colors hover:border-primary hover:text-primary-foreground disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted-foreground"
          >
            <ChevronDown size={20} />
          </button>
        </div>
      )}

      <div className="flex md:hidden items-center justify-center gap-2">
        <button
          onClick={() => scroll("left")}
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => scroll("right")}
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
