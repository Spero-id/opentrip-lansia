"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { destinationsData } from "@/lib/destinationsData";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Subs from "@/components/landing/Subs";
import { DestinationDomain } from "@/lib/Destination";

import Lightbox from "@/components/destinasi/detail/Lightbox";
import DestinationHeader from "@/components/destinasi/detail/DestinationHeader";
import DestinationGallery from "@/components/destinasi/detail/DestinationGallery";
import DestinationTabs from "@/components/destinasi/detail/DestinationTabs";
import AboutSection from "@/components/destinasi/detail/AboutSection";
import ItinerarySection from "@/components/destinasi/detail/ItinerarySection";
import MeetingSection from "@/components/destinasi/detail/MeetingSection";
import UlasanSection from "@/components/destinasi/detail/UlasanSection";
import BookingCard from "@/components/destinasi/detail/BookingCard";

export default function DestinationDetailPage({ params }) {
  const resolvedParams = use(params);
  const id = Number(resolvedParams.id);
  const dest = destinationsData.find((d) => d.id === id);

  const [activeTab, setActiveTab] = useState("tentang");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!dest) {
    notFound();
  }

  const images = dest.images?.length ? dest.images : [dest.image];
  const shortLocation = DestinationDomain.getShortLocation(dest);

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-[#df7224]/30">
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        <Link
          href="/trips"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#df7224] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Kembali ke Destinasi
        </Link>
      </div>

      <div className="pt-4 pb-4 px-4 sm:px-8 max-w-7xl mx-auto">
        <DestinationHeader dest={dest} />
        <DestinationGallery
          images={images}
          title={dest.title}
          onOpenLightbox={setLightboxIndex}
        />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 relative">
        <div className="lg:col-span-2 flex flex-col">
          <DestinationTabs activeTab={activeTab} onChange={setActiveTab} />

          <div className="min-h-[400px]">
            {activeTab === "tentang" && <AboutSection dest={dest} />}
            {activeTab === "itinerary" && <ItinerarySection dest={dest} shortLocation={shortLocation} />}
            {activeTab === "meeting" && <MeetingSection dest={dest} />}
            {activeTab === "ulasan" && <UlasanSection dest={dest} />}
          </div>
        </div>

        <div className="lg:col-span-1">
          <BookingCard dest={dest} />
        </div>
      </main>

      <Subs />
      <Footer />
    </div>
  );
}
