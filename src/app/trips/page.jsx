"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Subs from "@/components/landing/Subs";
import FilterPanel from "@/components/destinasi/FilterPanel";
import DestinasiHeader from "@/components/destinasi/DestinasiHeader";
import DestinationGrid from "@/components/destinasi/DestinationGrid";
import { destinationsData } from "@/lib/destinationsData";

export default function DestisasiPage() {
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [minRating, setMinRating] = useState(0);

  const hasActiveFilters =
    selectedLocation !== "" || priceMin !== "" || priceMax !== "" || minRating > 0;

  const resetAllFilters = () => {
    setSelectedLocation("");
    setPriceMin("");
    setPriceMax("");
    setMinRating(0);
    setSearch("");
  };

  const filtered = useMemo(() => {
    return destinationsData.filter((d) => {
      const matchSearch =
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.location.toLowerCase().includes(search.toLowerCase());
      const matchLocation =
        selectedLocation === "" || d.location === selectedLocation;
      const matchPriceMin = priceMin === "" || d.priceMin >= priceMin;
      const matchPriceMax = priceMax === "" || d.priceMin <= priceMax;
      const matchRating = d.rating >= minRating;
      return matchSearch && matchLocation && matchPriceMin && matchPriceMax && matchRating;
    });
  }, [search, selectedLocation, priceMin, priceMax, minRating]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="min-h-screen bg-white">
        <DestinasiHeader search={search} setSearch={setSearch} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-stretch">
            <div className="w-full lg:w-64 lg:shrink-0 lg:sticky lg:top-20">
              <FilterPanel
                destinations={destinationsData}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                priceMin={priceMin}
                setPriceMin={setPriceMin}
                priceMax={priceMax}
                setPriceMax={setPriceMax}
                minRating={minRating}
                setMinRating={setMinRating}
                onResetAll={resetAllFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </div>

            <DestinationGrid
              filtered={filtered}
              hasActiveFilters={hasActiveFilters}
              onReset={resetAllFilters}
            />
          </div>
        </div>
      </main>

      <Subs />
      <Footer />
    </div>
  );
}
