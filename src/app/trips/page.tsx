"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import FilterPanel from "@/features/trip/components/FilterPanel";
import DestinationListHeader from "@/features/trip/components/DestinationListHeader";
import DestinationGrid from "@/features/trip/components/DestinationGrid";
import Subs from "@/components/landing/Subs";
import { fetchTrips } from "@/features/trip/api/client";
import { useTripFilter } from "@/features/trip/hooks/use-trip-filter";
import type { TripDetail } from "@/features/trip/types";

function TripsContent() {
  const searchParams = useSearchParams();
  const [destinations, setDestinations] = useState<TripDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const filter = useTripFilter(destinations, searchParams.get("q") || "");

  useEffect(() => {
    let cancelled = false;
    fetchTrips()
      .then((mapped) => {
        if (!cancelled) setDestinations(mapped);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <main className="min-h-screen bg-white">
        <DestinationListHeader search={filter.search} setSearch={filter.setSearch} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-stretch">
            <div className="w-full lg:w-64 lg:shrink-0 lg:sticky lg:top-20">
              <FilterPanel
                destinations={destinations}
                selectedLocation={filter.selectedLocation}
                setSelectedLocation={filter.setSelectedLocation}
                priceMin={filter.priceMin}
                setPriceMin={filter.setPriceMin}
                priceMax={filter.priceMax}
                setPriceMax={filter.setPriceMax}
                selectedCategories={filter.selectedCategories}
                setSelectedCategories={filter.setSelectedCategories}
                isSeniorFriendlyOnly={filter.isSeniorFriendlyOnly}
                setIsSeniorFriendlyOnly={filter.setIsSeniorFriendlyOnly}
                onResetAll={filter.resetAllFilters}
                hasActiveFilters={filter.hasActiveFilters}
              />
            </div>
            <DestinationGrid
              filtered={filter.filtered}
              hasActiveFilters={filter.hasActiveFilters}
              onReset={filter.resetAllFilters}
              loading={loading}
            />
          </div>
        </div>
      </main>
      <Subs />
    </div>
  );
}

export default function TripsPage() {
  return (
    <Suspense fallback={null}>
      <TripsContent />
    </Suspense>
  );
}
