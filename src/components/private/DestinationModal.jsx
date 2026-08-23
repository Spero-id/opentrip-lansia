"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Search, Package } from "lucide-react";
import DestinationCard from "./DestinationCard";

const baseInput =
  "w-full px-3 py-2.5 rounded-lg border text-[13px] leading-5 bg-white placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 transition-colors";
const normalBorder = "border-[#D1D5DB] focus:border-[#F49D1A]";

export default function DestinationModal({
  isOpen,
  onClose,
  destinations = [],
  onSelect,
  searchValue = "",
  onSearchChange,
}) {
  const [mounted, setMounted] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    rafRef.current = requestAnimationFrame(() => setMounted(true));

    const onKey = (e) => { if (e.key === "Escape") onClose(); };
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
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center px-4 py-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm w-full max-w-4xl flex flex-col overflow-hidden"
        style={{ maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-[#1F2A37] flex items-center gap-2">
              <Package size={16} strokeWidth={1.8} color="#6B7280" className="shrink-0" />
              Pilih Paket Web
            </h3>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#374151] hover:bg-gray-100 transition-colors"
              aria-label="Tutup"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-[#E5E7EB]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={16} />
            <input
              type="text"
              placeholder="Ketik nama paket..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`${baseInput} pl-10 transition-colors ${normalBorder}`}
            />
          </div>
        </div>

        {/* Destinations list */}
        <div
          className="flex-1 overflow-y-auto px-5 sm:px-6 py-5"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}
        >
          {destinations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[13px] text-[#6B7280]">
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
