"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Subs from "@/components/landing/Subs";
import FilterPanel from "@/components/destinasi/FilterPanel";
import DestinasiHeader from "@/components/destinasi/DestinasiHeader";
import DestinationGrid from "@/components/destinasi/DestinationGrid";
import { destinationsData } from "@/lib/destinationsData";
import { toDetail } from "@/lib/Destination";

export default function DestisasiPage() {
  const [destinations, setDestinations] = useState(destinationsData);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSeniorFriendlyOnly, setIsSeniorFriendlyOnly] = useState(false);

  useEffect(() => {
    fetch("/api/trips")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const active = data.filter((d) => d.status === "published");
          const mapped = active.map((d) => toDetail(d));
          setDestinations(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hasActiveFilters =
    selectedLocation !== "" ||
    priceMin !== "" ||
    priceMax !== "" ||
    selectedCategory !== "" ||
    isSeniorFriendlyOnly === true;

  const resetAllFilters = () => {
    setSelectedLocation("");
    setPriceMin("");
    setPriceMax("");
    setSelectedCategory("");
    setIsSeniorFriendlyOnly(false);
    setSearch("");
  };

  const filtered = useMemo(() => {
    return destinations.filter((d) => {
      const titleStr = d.title || d.name || "";
      const locStr = d.location || "";
      const categoryStr = d.category || "";

      const matchSearch =
        titleStr.toLowerCase().includes(search.toLowerCase()) ||
        locStr.toLowerCase().includes(search.toLowerCase()) ||
        categoryStr.toLowerCase().includes(search.toLowerCase());

      const matchLocation =
        selectedLocation === "" || locStr === selectedLocation;

      const matchPriceMin = priceMin === "" || (d.priceMin ?? 0) >= Number(priceMin);
      const matchPriceMax = priceMax === "" || (d.priceMin ?? 0) <= Number(priceMax);

      const matchCategory =
        selectedCategory === "" ||
        categoryStr.toLowerCase() === selectedCategory.toLowerCase();

      const matchSenior =
        !isSeniorFriendlyOnly ||
        d.isSeniorFriendly === true ||
        d.isSeniorFriendly !== false;

      return (
        matchSearch &&
        matchLocation &&
        matchPriceMin &&
        matchPriceMax &&
        matchCategory &&
        matchSenior
      );
    });
  }, [
    destinations,
    search,
    selectedLocation,
    priceMin,
    priceMax,
    selectedCategory,
    isSeniorFriendlyOnly,
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="min-h-screen bg-white">
        <DestinasiHeader search={search} setSearch={setSearch} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-stretch">
            <div className="w-full lg:w-64 lg:shrink-0 lg:sticky lg:top-20">
              <FilterPanel
                destinations={destinations}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                priceMin={priceMin}
                setPriceMin={setPriceMin}
                priceMax={priceMax}
                setPriceMax={setPriceMax}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                isSeniorFriendlyOnly={isSeniorFriendlyOnly}
                setIsSeniorFriendlyOnly={setIsSeniorFriendlyOnly}
                onResetAll={resetAllFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </div>

            <DestinationGrid
              filtered={filtered}
              hasActiveFilters={hasActiveFilters}
              onReset={resetAllFilters}
              loading={loading}
            />
          </div>
        </div>
      </main>

      <Subs />
      <Footer />
    </div>
  );
}
