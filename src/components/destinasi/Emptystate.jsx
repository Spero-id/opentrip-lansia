"use client";

import { SlidersHorizontal } from "lucide-react";

export default function EmptyState({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-gray-200 bg-white">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: "rgba(223,114,36,0.08)" }}
      >
        <SlidersHorizontal size={24} style={{ color: "#df7224" }} />
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-1">
        Tidak ada destinasi cocok
      </p>
      <p className="text-xs text-gray-400 mb-5 max-w-xs">
        Coba sesuaikan kata kunci pencarian atau reset filter yang aktif.
      </p>
      <button
        onClick={onReset}
        className="px-5 py-2.5 rounded-xl text-white text-xs font-bold"
        style={{ backgroundColor: "#df7224" }}
      >
        Reset Semua Filter
      </button>
    </div>
  );
}
