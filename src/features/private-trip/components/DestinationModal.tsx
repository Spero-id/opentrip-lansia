"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Search, Package } from "lucide-react";
import DestinationCard from "./DestinationCard";
import type { PrivateTripDestination } from "@/features/private-trip/types";

const baseInput =
  "w-full px-3 py-2.5 rounded-lg border text-[13px] leading-5 bg-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors";
const normalBorder = "border-border focus:border-primary";

export default function DestinationModal({
  isOpen,
  onClose,
  destinations = [],
  onSelect,
  searchValue = "",
  onSearchChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  destinations?: PrivateTripDestination[];
  onSelect: (dest: PrivateTripDestination) => void;
  searchValue?: string;
  onSearchChange: (value: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    rafRef.current = requestAnimationFrame(() => setMounted(true));

    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-foreground/50 flex items-center justify-center px-4 py-8"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl border border-border shadow-sm w-full max-w-4xl flex flex-col overflow-hidden"
        style={{ maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-foreground flex items-center gap-2">
              <Package size={16} strokeWidth={1.8} className="shrink-0 text-muted-foreground" />
              Pilih Paket Web
            </h3>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Tutup"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="px-5 sm:px-6 pt-5 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Ketik nama paket..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`${baseInput} pl-10 transition-colors ${normalBorder}`}
            />
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto px-5 sm:px-6 pt-3 pb-5"
          style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent" }}
        >
          {destinations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[13px] text-muted-foreground">
                Tidak ada paket tersedia
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 w-full">
              {destinations.map((dest) => (
                <DestinationCard
                  key={dest.id}
                  dest={dest}
                  onSelect={() => {
                    onSelect(dest);
                    onClose();
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
