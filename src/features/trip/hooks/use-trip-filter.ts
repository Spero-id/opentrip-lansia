"use client";

import { useMemo, useState } from "react";
import type { TripDetail } from "@/features/trip/types";

export interface TripFilters {
  search: string;
  selectedLocation: string;
  priceMin: string | number;
  priceMax: string | number;
  selectedCategories: string[];
  isSeniorFriendlyOnly: boolean;
}

export const INITIAL_TRIP_FILTERS: TripFilters = {
  search: "",
  selectedLocation: "",
  priceMin: "",
  priceMax: "",
  selectedCategories: [],
  isSeniorFriendlyOnly: false,
};

export function filterTrips(destinations: TripDetail[], filters: TripFilters): TripDetail[] {
  const query = filters.search.toLowerCase();
  return destinations.filter((d) => {
    const titleStr = d.title || d.name || "";
    const locStr = d.location || "";
    const categoryStr = d.category || "";
    if (
      query &&
      !titleStr.toLowerCase().includes(query) &&
      !locStr.toLowerCase().includes(query) &&
      !categoryStr.toLowerCase().includes(query)
    ) {
      return false;
    }
    if (filters.selectedLocation !== "" && locStr !== filters.selectedLocation) return false;
    if (filters.priceMin !== "" && (d.priceMin ?? 0) < Number(filters.priceMin)) return false;
    if (filters.priceMax !== "" && (d.priceMin ?? 0) > Number(filters.priceMax)) return false;
    if (
      filters.selectedCategories.length > 0 &&
      !filters.selectedCategories.some((cat) => cat.toLowerCase() === categoryStr.toLowerCase())
    ) {
      return false;
    }
    if (filters.isSeniorFriendlyOnly && d.isSeniorFriendly !== true && d.isSeniorFriendly === false) {
      return false;
    }
    return true;
  });
}

export function hasActiveTripFilters(filters: TripFilters): boolean {
  return (
    filters.selectedLocation !== "" ||
    filters.priceMin !== "" ||
    filters.priceMax !== "" ||
    filters.selectedCategories.length > 0 ||
    filters.isSeniorFriendlyOnly === true
  );
}

export function useTripFilter(destinations: TripDetail[], initialQuery = "") {
  const [search, setSearch] = useState(initialQuery);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [priceMin, setPriceMin] = useState<string | number>("");
  const [priceMax, setPriceMax] = useState<string | number>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSeniorFriendlyOnly, setIsSeniorFriendlyOnly] = useState(false);

  const filters: TripFilters = useMemo(
    () => ({ search, selectedLocation, priceMin, priceMax, selectedCategories, isSeniorFriendlyOnly }),
    [search, selectedLocation, priceMin, priceMax, selectedCategories, isSeniorFriendlyOnly],
  );

  const filtered = useMemo(() => filterTrips(destinations, filters), [destinations, filters]);
  const hasActiveFilters = useMemo(() => hasActiveTripFilters(filters), [filters]);

  function resetAllFilters() {
    setSelectedLocation("");
    setPriceMin("");
    setPriceMax("");
    setSelectedCategories([]);
    setIsSeniorFriendlyOnly(false);
    setSearch("");
  }

  return {
    search,
    setSearch,
    selectedLocation,
    setSelectedLocation,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    selectedCategories,
    setSelectedCategories,
    isSeniorFriendlyOnly,
    setIsSeniorFriendlyOnly,
    filtered,
    hasActiveFilters,
    resetAllFilters,
  };
}
