"use client";

import { SlidersHorizontal } from "lucide-react";

export default function ResultsBar({ count, hasActiveFilters, onReset }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={15} className="text-gray-400" />
        <span className="text-sm font-semibold text-gray-700">
          {count} destinasi ditemukan
        </span>
      </div>
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="text-xs font-semibold text-[#F49D1A] underline"
        >
          Reset filter
        </button>
      )}
    </div>
  );
}
