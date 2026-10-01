"use client";

import { Suspense, use, useEffect, useOptimistic, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Subs from "@/features/newsletter/components/Subs";
import { DestinationDomain } from "@/lib/destination";
import Lightbox from "@/features/trip/components/detail/Lightbox";
import DestinationHeader from "@/features/trip/components/detail/DestinationHeader";
import DestinationGallery from "@/features/trip/components/detail/DestinationGallery";
import DestinationTabs from "@/features/trip/components/detail/DestinationTabs";
import AboutSection from "@/features/trip/components/detail/AboutSection";
import AccessibilitySection from "@/features/trip/components/detail/AccessibilitySection";
import ItinerarySection from "@/features/trip/components/detail/ItinerarySection";
import ReviewsSection from "@/features/trip/components/detail/ReviewsSection";
import TripBookingCard from "@/features/trip/components/detail/BookingCard";
import { fetchTripById, getTripImages } from "@/features/trip/api/client";
import type { TripDetail, TripTabId } from "@/features/trip/types";

export default function DestinationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [dest, setDest] = useState<TripDetail | null>(null);
  const [status, setStatus] = useState<"loading" | "found" | "notfound">("loading");

  useEffect(() => {
    const rawId = resolvedParams.id;
    let cancelled = false;
    fetchTripById(rawId)
      .then((found) => {
        if (cancelled) return;
        setDest(found);
        setStatus(found ? "found" : "notfound");
      })
      .catch(() => {
        if (cancelled) return;
        setDest(null);
        setStatus("notfound");
      });
    return () => {
      cancelled = true;
    };
  }, [resolvedParams.id]);

  const [activeTab, setActiveTab] = useState<TripTabId>("tentang");
  const [optimisticTab, switchTab] = useOptimistic<TripTabId, TripTabId>(activeTab, (_current, next) => next);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  function handleTabChange(next: TripTabId) {
    switchTab(next);
    setActiveTab(next);
  }

  if (status === "notfound") {
    notFound();
  }

  if (status !== "found" || !dest) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center min-h-[60vh] text-sm text-gray-400">
          Memuat...
        </div>
      </div>
    );
  }

  const images = getTripImages(dest);
  const shortLocation = DestinationDomain.getShortLocation(dest);

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-[#F49D1A]/30">
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        <Link
          href="/trips"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#F49D1A] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Kembali ke Destinasi
        </Link>
      </div>

      <div className="pt-4 pb-4 px-4 sm:px-8 max-w-7xl mx-auto">
        <DestinationHeader dest={dest} />
        <Suspense fallback={<div className="h-[30vh] min-h-[200px] rounded-3xl bg-gray-100" />}>
          <DestinationGallery
            images={images}
            title={dest.title}
            onOpenLightbox={setLightboxIndex}
          />
        </Suspense>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 relative">
        <div className="lg:col-span-2 flex flex-col">
          <DestinationTabs activeTab={optimisticTab} onChange={handleTabChange} />
          <div className="min-h-[400px]">
            {optimisticTab === "tentang" && <AboutSection dest={dest} />}
            {optimisticTab === "itinerary" && <ItinerarySection dest={dest} shortLocation={shortLocation} />}
            {optimisticTab === "aksesibilitas" && <AccessibilitySection dest={dest} />}
            {optimisticTab === "ulasan" && (
              <Suspense fallback={<div className="py-10 text-center text-sm text-gray-400">Memuat ulasan...</div>}>
                <ReviewsSection tripId={dest.id} />
              </Suspense>
            )}
          </div>
        </div>
        <div className="lg:col-span-1">
          <TripBookingCard dest={dest} />
        </div>
      </main>
      <Subs />
    </div>
  );
}
