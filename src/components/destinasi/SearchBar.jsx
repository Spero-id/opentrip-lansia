"use client";

import { Search, TrendingUp, X, ArrowRight } from "lucide-react";

const A = "#df7224";

const quickTags = ["Bali", "Bromo", "Raja Ampat", "Borobudur", "Labuan Bajo"];

export default function SearchBar({ searchQuery, onSearchChange, onClear }) {
  return (
    <div className="w-full flex flex-col gap-3">
      <div
        className="relative w-full p-2.5 sm:p-3 rounded-2xl shadow-lg transition-all duration-300"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(223,114,36,0.08)",
        }}
      >
        <div className="flex items-center gap-3 w-full">
          <div className="pl-2 shrink-0" style={{ color: A }}>
            <Search size={22} strokeWidth={2.5} />
          </div>

          <input
            type="text"
            placeholder="Cari destinasi atau lokasi wisata..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-sm font-medium focus:outline-none py-2"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => { onSearchChange(""); onClear?.(); }}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-black/5 transition-colors shrink-0"
            >
              <X size={17} strokeWidth={2} />
            </button>
          )}

          <button
            type="button"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-white font-semibold text-xs sm:text-sm transition-all shrink-0 active:scale-95"
            style={{ backgroundColor: A }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#c8631e")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = A)}
          >
            <span>Cari</span>
            <ArrowRight size={14} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 py-1 px-1 text-xs text-gray-500 overflow-x-auto">
        <span className="font-semibold flex items-center gap-1.5 shrink-0">
          <TrendingUp size={12} strokeWidth={2} />
          Populer:
        </span>
        {quickTags.map((tag) => {
          const active = searchQuery.toLowerCase().includes(tag.toLowerCase());
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onSearchChange(active ? "" : tag)}
              className="px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all"
              style={
                active
                  ? { backgroundColor: A, color: "#fff" }
                  : { backgroundColor: "rgba(255,255,255,0.7)", color: "#374151" }
              }
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
