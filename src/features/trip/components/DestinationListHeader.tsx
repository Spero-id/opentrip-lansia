"use client";

import SearchBar from "./SearchBar";

interface DestinationListHeaderProps {
  search: string;
  setSearch: (value: string) => void;
}

export default function DestinationListHeader({ search, setSearch }: DestinationListHeaderProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      <p className="text-primary-foreground font-semibold text-sm tracking-wide mb-2">
        JELAJAHI INDONESIA
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
        Semua <span className="text-primary-foreground">Destinasi</span>
      </h1>
      <SearchBar
        searchQuery={search}
        onSearchChange={setSearch}
        onClear={() => setSearch("")}
      />
    </div>
  );
}
