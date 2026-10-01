"use client";

import SearchBar from "./SearchBar";

export default function DestinasiHeader({ search, setSearch }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      <p className="text-[#F49D1A] font-semibold text-sm tracking-wide mb-2">
        JELAJAHI INDONESIA
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
        Semua <span className="text-[#F49D1A]">Destinasi</span>
      </h1>
      <SearchBar
        searchQuery={search}
        onSearchChange={setSearch}
        onClear={() => setSearch("")}
      />
    </div>
  );
}
