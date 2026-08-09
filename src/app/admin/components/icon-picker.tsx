"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import * as Icons from "lucide-react";
import { Search, X, Check } from "lucide-react";

// Curated list of popular icons for trip facilities
export const POPULAR_FACILITY_ICONS = [
  "Bus",
  "Car",
  "Plane",
  "Ship",
  "Train",
  "Hotel",
  "Bed",
  "Utensils",
  "Coffee",
  "Wifi",
  "UserCheck",
  "Users",
  "ShieldCheck",
  "Camera",
  "Tv",
  "Ticket",
  "Accessibility",
  "Bath",
  "Sparkles",
  "Star",
  "Sun",
  "Umbrella",
  "Tent",
  "Heart",
  "MapPin",
  "Briefcase",
  "Compass",
  "Shield",
  "Luggage",
  "Mountain",
  "Trees",
  "Check",
];

// Helper to render dynamic Lucide icon safely
export function DynamicLucideIcon({
  name,
  className = "w-4 h-4",
  size,
}: {
  name?: string | null;
  className?: string;
  size?: number;
}) {
  if (!name) return <Check className={className} size={size} />;
  
  const iconKey = name.trim();
  const IconComponent = (Icons as any)[iconKey] || (Icons as any)[`${iconKey}Icon`] || Icons.Check;

  return <IconComponent className={className} size={size} />;
}

// Get all valid Lucide icon names
const ALL_ICON_NAMES = Object.keys(Icons).filter(
  (key) =>
    /^[A-Z]/.test(key) &&
    !key.endsWith("Icon") &&
    key !== "LucideIcon" &&
    key !== "createLucideIcon" &&
    (typeof (Icons as any)[key] === "object" || typeof (Icons as any)[key] === "function")
);

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
}

export default function IconPicker({ value, onChange, label }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  const selectedIcon = value || "Check";

  // Filter icon names based on search query
  const filteredIcons = useMemo(() => {
    if (!search.trim()) return ALL_ICON_NAMES.slice(0, 80);
    const q = search.toLowerCase().replace(/[^a-z0-9]/g, "");
    return ALL_ICON_NAMES.filter((name) =>
      name.toLowerCase().includes(q)
    ).slice(0, 100);
  }, [search]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block w-full" ref={popoverRef}>
      {label && <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white hover:border-[#F49D1A] focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 transition shadow-xs"
      >
        <div className="flex items-center gap-2 truncate">
          <span className="p-1 rounded-lg bg-amber-50 text-[#F49D1A] shrink-0 border border-amber-200/50">
            <DynamicLucideIcon name={selectedIcon} className="w-4 h-4" />
          </span>
          <span className="font-medium text-slate-700 truncate">{selectedIcon}</span>
        </div>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Pilih</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 w-72 sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 space-y-3 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-800">Pilih Icon Lucide</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari icon (cth: Bus, Wifi, Bed)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
              autoFocus
            />
          </div>

          {!search.trim() && (
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Populer</span>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-50/50 rounded-xl border border-slate-100">
                {POPULAR_FACILITY_ICONS.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    title={iconName}
                    onClick={() => {
                      onChange(iconName);
                      setIsOpen(false);
                    }}
                    className={`p-2 rounded-lg flex items-center justify-center transition ${
                      selectedIcon === iconName
                        ? "bg-[#F49D1A] text-white shadow-sm"
                        : "bg-white text-slate-600 hover:bg-amber-50 hover:text-[#F49D1A] border border-slate-200/60"
                    }`}
                  >
                    <DynamicLucideIcon name={iconName} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              {search.trim() ? `Hasil Pencarian (${filteredIcons.length})` : "Semua Icon"}
            </span>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-48 overflow-y-auto p-1 bg-slate-50/50 rounded-xl border border-slate-100">
              {filteredIcons.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  title={iconName}
                  onClick={() => {
                    onChange(iconName);
                    setIsOpen(false);
                  }}
                  className={`p-2 rounded-lg flex items-center justify-center transition ${
                    selectedIcon === iconName
                      ? "bg-[#F49D1A] text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-amber-50 hover:text-[#F49D1A] border border-slate-200/60"
                  }`}
                >
                  <DynamicLucideIcon name={iconName} className="w-4 h-4" />
                </button>
              ))}
              {filteredIcons.length === 0 && (
                <p className="col-span-full py-4 text-center text-xs text-slate-400">
                  Icon &quot;{search}&quot; tidak ditemukan.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
