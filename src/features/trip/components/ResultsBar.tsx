"use client";

import { SlidersHorizontal } from "lucide-react";

interface ResultsBarProps {
  count: number;
  hasActiveFilters: boolean;
  onReset: () => void;
}

export default function ResultsBar({ count, hasActiveFilters, onReset }: ResultsBarProps) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={15} className="text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">
          {count} destinasi ditemukan
        </span>
      </div>
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="text-xs font-semibold text-primary-foreground underline"
        >
          Reset filter
        </button>
      )}
    </div>
  );
}
