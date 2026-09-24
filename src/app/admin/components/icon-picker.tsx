"use client";

import { useState, useMemo, useRef, useEffect, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import * as Icons from "lucide-react";
import { Search, X, ChevronDown, Sparkles, Plus, type LucideIcon } from "lucide-react";

const iconMap = Icons as unknown as Record<string, LucideIcon>;

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

export const CATEGORIZED_FACILITY_ICONS = [
  {
    category: "Populer",
    icons: POPULAR_FACILITY_ICONS.slice(0, 16),
  },
  {
    category: "Transportasi",
    icons: ["Bus", "Car", "Plane", "Ship", "Train", "MapPin", "Compass", "Luggage", "Navigation"],
  },
  {
    category: "Akomodasi & Fasilitas",
    icons: ["Hotel", "Bed", "Home", "Building", "Tent", "Key", "Tv", "Wifi", "Bath", "Flame"],
  },
  {
    category: "Kuliner & Konsumsi",
    icons: ["Utensils", "Coffee", "Wine", "Apple", "GlassWater", "Pizza", "Cake"],
  },
  {
    category: "Layanan & Layanan Lansia",
    icons: ["UserCheck", "Users", "ShieldCheck", "Accessibility", "Heart", "Headphones", "Stethoscope", "FirstAid"],
  },
  {
    category: "Aktivitas & Hiburan",
    icons: ["Camera", "Ticket", "Sun", "Umbrella", "Mountain", "Trees", "Briefcase", "Sparkles", "Star"],
  },
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
  if (!name || !name.trim()) return null;
  
  const iconKey = name.trim();
  const IconComponent = iconMap[iconKey] || iconMap[`${iconKey}Icon`] || Icons.Check;

  return <IconComponent className={className} size={size} />;
}

// Get all valid Lucide icon names
const ALL_ICON_NAMES = Object.keys(Icons).filter(
  (key) =>
    /^[A-Z]/.test(key) &&
    !key.endsWith("Icon") &&
    key !== "LucideIcon" &&
    key !== "createLucideIcon" &&
    (typeof iconMap[key] === "object" || typeof iconMap[key] === "function")
);

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
  variant?: "default" | "compact" | "icon-only";
  buttonClassName?: string;
}

export default function IconPicker({
  value,
  onChange,
  label,
  variant = "default",
  buttonClassName,
}: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Populer");
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const selectedIcon = value || "";
  const hasIcon = Boolean(selectedIcon.trim());

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const popoverWidth = Math.min(330, window.innerWidth - 24);
    const popoverHeight = 350;

    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - popoverWidth - 12);
    }

    const spaceBelow = window.innerHeight - rect.bottom;
    let top: number;

    if (spaceBelow < popoverHeight && rect.top > popoverHeight) {
      top = rect.top - popoverHeight - 6;
    } else {
      top = rect.bottom + 6;
    }

    setPopoverStyle({
      position: "fixed",
      top: `${Math.max(12, top)}px`,
      left: `${Math.max(12, left)}px`,
      width: `${popoverWidth}px`,
      zIndex: 99999,
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

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
      const target = event.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
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
    <div className="relative inline-block w-full">
      {label && <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>}

      {variant === "icon-only" ? (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title={hasIcon ? `Ganti Ikon (${selectedIcon})` : "Pilih Ikon"}
          className={`relative group h-10 w-10 rounded-xl flex items-center justify-center transition-all shadow-xs border shrink-0 ${
            isOpen
              ? hasIcon
                ? "bg-[#F49D1A] text-white border-[#F49D1A] ring-2 ring-[#F49D1A]/30 scale-105"
                : "bg-slate-700 text-white border-slate-700 ring-2 ring-slate-400/30 scale-105"
              : hasIcon
              ? "bg-amber-50/90 text-[#F49D1A] hover:bg-amber-100/90 border-amber-200 hover:border-amber-300 hover:scale-102"
              : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 border-slate-200 hover:border-slate-300 hover:scale-102"
          } ${buttonClassName || ""}`}
        >
          {hasIcon ? (
            <DynamicLucideIcon name={selectedIcon} className="w-5 h-5 transition-transform group-hover:scale-110" />
          ) : (
            <Plus className="w-4 h-4 transition-transform group-hover:scale-110 opacity-70" />
          )}
          <span
            className={`absolute -bottom-1 -right-1 rounded-full p-0.5 shadow-xs border transition ${
              hasIcon
                ? "bg-white text-slate-400 border-slate-200 group-hover:text-[#F49D1A] group-hover:border-amber-300"
                : "bg-white text-slate-400 border-slate-200 group-hover:text-slate-600 group-hover:border-slate-300"
            }`}
          >
            <ChevronDown className="w-2.5 h-2.5" />
          </span>
        </button>
      ) : variant === "compact" ? (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white hover:border-[#F49D1A] focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 transition shadow-xs ${buttonClassName || ""}`}
        >
          <span
            className={`p-1 rounded-lg shrink-0 border ${
              hasIcon ? "bg-amber-50 text-[#F49D1A] border-amber-200/50" : "bg-slate-100 text-slate-400 border-slate-200"
            }`}
          >
            {hasIcon ? <DynamicLucideIcon name={selectedIcon} className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </span>
          <span className={`font-medium truncate ${hasIcon ? "text-slate-700" : "text-slate-400 italic"}`}>
            {hasIcon ? selectedIcon : "Pilih Ikon"}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-auto shrink-0" />
        </button>
      ) : (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white hover:border-[#F49D1A] focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 transition shadow-xs ${buttonClassName || ""}`}
        >
          <div className="flex items-center gap-2 truncate">
            <span
              className={`p-1 rounded-lg shrink-0 border ${
                hasIcon ? "bg-amber-50 text-[#F49D1A] border-amber-200/50" : "bg-slate-100 text-slate-400 border-slate-200"
              }`}
            >
              {hasIcon ? <DynamicLucideIcon name={selectedIcon} className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </span>
            <span className={`font-medium truncate ${hasIcon ? "text-slate-700" : "text-slate-400 italic"}`}>
              {hasIcon ? selectedIcon : "Pilih Ikon"}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Pilih</span>
        </button>
      )}

      {isClient &&
        isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            style={popoverStyle}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-50 text-[#F49D1A]">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-slate-800">Pilih Ikon Fasilitas</span>
              </div>
              <div className="flex items-center gap-2">
                {hasIcon && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange("");
                      setIsOpen(false);
                    }}
                    className="text-[11px] font-medium text-slate-500 hover:text-red-600 transition"
                    title="Kosongkan Ikon"
                  >
                    Kosongkan
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari ikon (cth: Bus, Wifi, Bed, Shield)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
                autoFocus
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {!search.trim() ? (
              <div className="space-y-2">
                {/* Category selector pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                  {CATEGORIZED_FACILITY_ICONS.map((cat) => (
                    <button
                      key={cat.category}
                      type="button"
                      onClick={() => setActiveCategory(cat.category)}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                        activeCategory === cat.category
                          ? "bg-[#F49D1A] text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                      }`}
                    >
                      {cat.category}
                    </button>
                  ))}
                </div>

                {/* Icon grid for selected category */}
                <div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5 max-h-44 overflow-y-auto p-1.5 bg-slate-50/70 rounded-xl border border-slate-100">
                  {(CATEGORIZED_FACILITY_ICONS.find((c) => c.category === activeCategory)?.icons || POPULAR_FACILITY_ICONS).map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      title={iconName}
                      onClick={() => {
                        onChange(iconName);
                        setIsOpen(false);
                      }}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center transition group relative ${
                        selectedIcon === iconName
                          ? "bg-[#F49D1A] text-white shadow-md ring-2 ring-[#F49D1A]/40 scale-105"
                          : "bg-white text-slate-700 hover:bg-amber-50 hover:text-[#F49D1A] border border-slate-200/80 hover:border-amber-200"
                      }`}
                    >
                      <DynamicLucideIcon name={iconName} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Hasil Pencarian ({filteredIcons.length})
                </span>
                <div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5 max-h-44 overflow-y-auto p-1.5 bg-slate-50/70 rounded-xl border border-slate-100">
                  {filteredIcons.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      title={iconName}
                      onClick={() => {
                        onChange(iconName);
                        setIsOpen(false);
                      }}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center transition ${
                        selectedIcon === iconName
                          ? "bg-[#F49D1A] text-white shadow-md ring-2 ring-[#F49D1A]/40 scale-105"
                          : "bg-white text-slate-700 hover:bg-amber-50 hover:text-[#F49D1A] border border-slate-200/80 hover:border-amber-200"
                      }`}
                    >
                      <DynamicLucideIcon name={iconName} className="w-4 h-4" />
                    </button>
                  ))}
                  {filteredIcons.length === 0 && (
                    <p className="col-span-full py-4 text-center text-xs text-slate-400">
                      Ikon &quot;{search}&quot; tidak ditemukan.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Active selection footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Ikon terpilih:</span>
              {hasIcon ? (
                <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1.5">
                  <DynamicLucideIcon name={selectedIcon} className="w-3.5 h-3.5 text-[#F49D1A]" />
                  {selectedIcon}
                </span>
              ) : (
                <span className="font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md italic">
                  Tanpa Ikon
                </span>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

