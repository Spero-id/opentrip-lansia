"use client";

import { useState, useMemo, useRef, useEffect, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import * as Icons from "lucide-react";
import { Search, X, ChevronDown, Sparkles, Plus, type LucideIcon } from "lucide-react";

const iconMap = Icons as unknown as Record<string, LucideIcon>;

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

  const filteredIcons = useMemo(() => {
    if (!search.trim()) return ALL_ICON_NAMES.slice(0, 80);
    const q = search.toLowerCase().replace(/[^a-z0-9]/g, "");
    return ALL_ICON_NAMES.filter((name) =>
      name.toLowerCase().includes(q)
    ).slice(0, 100);
  }, [search]);

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
      {label && <label className="block text-xs font-semibold text-muted-foreground mb-1">{label}</label>}

      {variant === "icon-only" ? (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title={hasIcon ? `Ganti Ikon (${selectedIcon})` : "Pilih Ikon"}
          className={`relative group h-10 w-10 rounded-xl flex items-center justify-center transition-all shadow-xs border shrink-0 ${
            isOpen
              ? hasIcon
                ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/30 scale-105"
                : "bg-foreground text-background border-foreground ring-2 ring-ring/30 scale-105"
              : hasIcon
              ? "bg-warning-50/90 text-primary-foreground hover:bg-warning-100/90 border-warning-200 hover:border-warning-300 hover:scale-102"
              : "bg-muted text-muted-foreground hover:bg-muted hover:text-muted-foreground border-border hover:border-border hover:scale-102"
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
                ? "bg-card text-muted-foreground border-border group-hover:text-primary-foreground group-hover:border-warning-300"
                : "bg-card text-muted-foreground border-border group-hover:text-muted-foreground group-hover:border-border"
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
          className={`flex items-center gap-2 px-3 py-2 text-xs border border-border rounded-xl bg-card hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition shadow-xs ${buttonClassName || ""}`}
        >
          <span
            className={`p-1 rounded-lg shrink-0 border ${
              hasIcon ? "bg-warning-50 text-primary-foreground border-warning-200/50" : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {hasIcon ? <DynamicLucideIcon name={selectedIcon} className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </span>
          <span className={`font-medium truncate ${hasIcon ? "text-foreground" : "text-muted-foreground italic"}`}>
            {hasIcon ? selectedIcon : "Pilih Ikon"}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0" />
        </button>
      ) : (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs border border-border rounded-xl bg-card hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition shadow-xs ${buttonClassName || ""}`}
        >
          <div className="flex items-center gap-2 truncate">
            <span
              className={`p-1 rounded-lg shrink-0 border ${
                hasIcon ? "bg-warning-50 text-primary-foreground border-warning-200/50" : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {hasIcon ? <DynamicLucideIcon name={selectedIcon} className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </span>
            <span className={`font-medium truncate ${hasIcon ? "text-foreground" : "text-muted-foreground italic"}`}>
              {hasIcon ? selectedIcon : "Pilih Ikon"}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Pilih</span>
        </button>
      )}

      {isClient &&
        isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            style={popoverStyle}
            className="bg-card rounded-2xl border border-border shadow-2xl p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-warning-50 text-primary-foreground">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-foreground">Pilih Ikon Fasilitas</span>
              </div>
              <div className="flex items-center gap-2">
                {hasIcon && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange("");
                      setIsOpen(false);
                    }}
                    className="text-[11px] font-medium text-muted-foreground hover:text-destructive-600 transition"
                    title="Kosongkan Ikon"
                  >
                    Kosongkan
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-muted-foreground transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari ikon (cth: Bus, Wifi, Bed, Shield)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 text-xs bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                autoFocus
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-muted-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {!search.trim() ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                  {CATEGORIZED_FACILITY_ICONS.map((cat) => (
                    <button
                      key={cat.category}
                      type="button"
                      onClick={() => setActiveCategory(cat.category)}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                        activeCategory === cat.category
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-muted text-muted-foreground hover:bg-border/70"
                      }`}
                    >
                      {cat.category}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5 max-h-44 overflow-y-auto p-1.5 bg-muted/70 rounded-xl border border-border">
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
                          ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/40 scale-105"
                          : "bg-card text-foreground hover:bg-warning-50 hover:text-primary-foreground border border-border/80 hover:border-warning-200"
                      }`}
                    >
                      <DynamicLucideIcon name={iconName} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Hasil Pencarian ({filteredIcons.length})
                </span>
                <div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5 max-h-44 overflow-y-auto p-1.5 bg-muted/70 rounded-xl border border-border">
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
                          ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/40 scale-105"
                          : "bg-card text-foreground hover:bg-warning-50 hover:text-primary-foreground border border-border/80 hover:border-warning-200"
                      }`}
                    >
                      <DynamicLucideIcon name={iconName} className="w-4 h-4" />
                    </button>
                  ))}
                  {filteredIcons.length === 0 && (
                    <p className="col-span-full py-4 text-center text-xs text-muted-foreground">
                      Ikon &quot;{search}&quot; tidak ditemukan.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Ikon terpilih:</span>
              {hasIcon ? (
                <span className="font-semibold text-foreground bg-muted px-2 py-0.5 rounded-md inline-flex items-center gap-1.5">
                  <DynamicLucideIcon name={selectedIcon} className="w-3.5 h-3.5 text-primary-foreground" />
                  {selectedIcon}
                </span>
              ) : (
                <span className="font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md italic">
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

