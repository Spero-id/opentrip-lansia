"use client";

import { useState, useMemo } from "react";
import { Filter, MapPin, DollarSign, Star, X, ChevronDown, ChevronUp } from "lucide-react";

const A = "#F49D1A";

export default function FilterPanel({
  destinations,
  selectedLocation,
  setSelectedLocation,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  minRating,
  setMinRating,
  onResetAll,
  hasActiveFilters,
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const allLocations = useMemo(
    () => [...new Set(destinations.map((d) => d.location))],
    [destinations]
  );

  function formatRupiah(value) {
    if (!value || isNaN(value) || value <= 0) return "Rp 0";
    return "Rp " + Math.floor(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  const ratingOptions = [
    { value: 0,   label: "Semua" },
    { value: 4.0, label: "4.0+" },
    { value: 4.5, label: "4.5+" },
    { value: 4.8, label: "4.8+" },
  ];

  const activeCount = [
    selectedLocation !== "",
    priceMin !== "",
    priceMax !== "",
    minRating > 0,
  ].filter(Boolean).length;

  return (
    <aside className="w-full">
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex items-center justify-between w-full p-4 rounded-2xl bg-white border border-gray-200 font-semibold text-sm shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Filter size={16} style={{ color: A }} />
            <span className="text-gray-800">Filter Destinasi</span>
            {activeCount > 0 && (
              <span
                className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                style={{ backgroundColor: A }}
              >
                {activeCount}
              </span>
            )}
          </div>
          {isMobileOpen ? (
            <ChevronUp size={18} className="text-gray-400" />
          ) : (
            <ChevronDown size={18} className="text-gray-400" />
          )}
        </button>
      </div>

      <div
        className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible ${
          isMobileOpen ? "block" : "hidden lg:block"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Filter size={16} style={{ color: A }} />
            <h2 className="text-sm font-bold text-gray-800">Filter</h2>
            {activeCount > 0 && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: A }}
              >
                {activeCount} aktif
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={onResetAll}
              className="text-xs font-semibold flex items-center gap-1 transition-colors"
              style={{ color: A }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              <X size={12} /> Reset
            </button>
          )}
        </div>

        <div className="p-5 space-y-6">
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={12} style={{ color: A }} />
              Lokasi
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 text-left focus:outline-none focus:border-[#F49D1A] transition-colors"
              >
                <span className={selectedLocation ? "text-gray-800" : "text-gray-400"}>
                  {selectedLocation || "Semua Lokasi"}
                </span>
                <ChevronDown
                  size={15}
                  className={`text-gray-400 transition-transform duration-200 ${isLocationOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isLocationOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsLocationOpen(false)}
                  />
                  <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-52 overflow-y-auto py-1">
                    <button
                      type="button"
                      onClick={() => { setSelectedLocation(""); setIsLocationOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
                        selectedLocation === ""
                          ? "text-white"
                          : "text-gray-700 hover:bg-[#F49D1A]/10"
                      }`}
                      style={selectedLocation === "" ? { backgroundColor: A } : {}}
                    >
                      Semua Lokasi
                    </button>
                    {allLocations.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => { setSelectedLocation(loc); setIsLocationOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
                          selectedLocation === loc
                            ? "text-white"
                            : "text-gray-700 hover:bg-[#F49D1A]/10"
                        }`}
                        style={selectedLocation === loc ? { backgroundColor: A } : {}}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {["Semua", ...allLocations.slice(0, 4).map(l => l.split(",")[0])].map((label, i) => {
                const fullLoc = i === 0 ? "" : allLocations[i - 1];
                const active = i === 0 ? selectedLocation === "" : selectedLocation === fullLoc;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setSelectedLocation(i === 0 ? "" : fullLoc)}
                    className="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
                    style={active
                      ? { backgroundColor: A, borderColor: A, color: "#fff" }
                      : { backgroundColor: "transparent", borderColor: "#e5e7eb", color: "#6b7280" }
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-2.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign size={12} style={{ color: A }} />
              Range Harga (Rp)
            </label>
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-gray-400">Harga Minimal</span>
                <input
                  type="number"
                  placeholder="Contoh: 200000"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F49D1A] focus:ring-2 focus:ring-[#F49D1A]/15 transition-all"
                />
                <p className="text-[10px] pl-1 font-medium" style={{ color: A }}>
                  {priceMin !== "" ? formatRupiah(priceMin) : "Tanpa batas minimal"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-gray-400">Harga Maksimal</span>
                <input
                  type="number"
                  placeholder="Contoh: 2000000"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F49D1A] focus:ring-2 focus:ring-[#F49D1A]/15 transition-all"
                />
                <p className="text-[10px] pl-1 font-medium" style={{ color: A }}>
                  {priceMax !== "" ? formatRupiah(priceMax) : "Tanpa batas maksimal"}
                </p>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-2.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Star size={12} style={{ color: A }} />
              Rating Minimum
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ratingOptions.map(({ value, label }) => {
                const active = minRating === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMinRating(value)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all"
                    style={active
                      ? { backgroundColor: A, borderColor: A, color: "#fff" }
                      : { backgroundColor: "#f9fafb", borderColor: "#e5e7eb", color: "#374151" }
                    }
                  >
                    <Star
                      size={11}
                      fill={active ? "#fff" : "#F59E0B"}
                      style={{ color: active ? "#fff" : "#F59E0B" }}
                    />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetAll}
              className="w-full py-2.5 px-4 rounded-xl text-red-500 text-xs font-bold border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
            >
              Hapus Semua Filter
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden w-full py-3 px-4 rounded-xl text-white text-xs font-bold transition-colors"
            style={{ backgroundColor: A }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#c47d12")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = A)}
          >
            Terapkan Filter
          </button>
        </div>
      </div>
    </aside>
  );
}
