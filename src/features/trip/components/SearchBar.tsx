"use client";

import { Search, TrendingUp, X, ArrowRight } from "lucide-react";

const A = "var(--primary)";

const quickTags = ["Bali", "Bromo", "Raja Ampat", "Borobudur", "Labuan Bajo"];

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClear?: () => void;
}

export default function SearchBar({ searchQuery, onSearchChange, onClear }: SearchBarProps) {
  return (
    <div className="w-full flex flex-col gap-3">
      <div
        className="relative w-full p-2.5 sm:p-3 rounded-2xl shadow-lg transition-all duration-300"
        style={{
          background: "color-mix(in srgb, var(--background) 85%, transparent)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid color-mix(in srgb, var(--background) 60%, transparent)",
          boxShadow: "0 8px 32px color-mix(in srgb, var(--foreground) 8%, transparent), 0 0 0 1px color-mix(in srgb, var(--primary) 8%, transparent)",
        }}
      >
        <div className="flex items-center gap-3 w-full">
          <div className="pl-2 shrink-0" style={{ color: "var(--primary-foreground)" }}>
            <Search size={22} strokeWidth={2.5} />
          </div>

          <input
            type="text"
            placeholder="Cari destinasi atau lokasi wisata..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none py-2"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => { onSearchChange(""); onClear?.(); }}
              className="p-1.5 rounded-full text-muted-foreground hover:text-muted-foreground hover:bg-foreground/5 transition-colors shrink-0"
            >
              <X size={17} strokeWidth={2} />
            </button>
          )}

          <button
            type="button"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-primary-foreground font-semibold text-xs sm:text-sm transition-all shrink-0 active:scale-95"
            style={{ backgroundColor: A }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "color-mix(in srgb, var(--primary) 90%, var(--foreground))")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = A)}
          >
            <span>Cari</span>
            <ArrowRight size={14} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 py-1 px-1 text-xs text-muted-foreground overflow-x-auto">
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
                  ? { backgroundColor: A, color: "var(--primary-foreground)" }
                  : { backgroundColor: "color-mix(in srgb, var(--background) 70%, transparent)", color: "var(--foreground)" }
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
