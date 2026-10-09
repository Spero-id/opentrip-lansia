"use client";

import { SlidersHorizontal } from "lucide-react";

export default function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border bg-card">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: "color-mix(in srgb, var(--primary) 8%, transparent)" }}
      >
        <SlidersHorizontal size={24} style={{ color: "var(--primary-foreground)" }} />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">
        Destinasi kamu akan segera hadir
      </p>
      <p className="text-xs text-muted-foreground mb-5 max-w-xs">
        Coba sesuaikan kata kunci pencarian atau reset filter yang lain.
      </p>
      <button
        onClick={onReset}
        className="px-5 py-2.5 rounded-xl text-primary-foreground text-xs font-bold"
        style={{ backgroundColor: "var(--primary)" }}
      >
        Reset Semua Filter
      </button>
    </div>
  );
}
