"use client";

import type { DestinationSummary } from "@/features/checkout";

export default function BookingSummary({ destination }: { destination?: DestinationSummary | null }) {
  if (!destination) {
    return (
      <div className="bg-warning-50 border border-warning-200 rounded-2xl p-5">
        <p className="text-sm text-warning-800 font-semibold">Belum ada destinasi dipilih.</p>
        <p className="text-xs text-warning-600 mt-1">Silakan pilih destinasi terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 bg-muted border border-border rounded-2xl p-4">
      <img src={destination.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQw8p4vVW46w8v2EDTYS5ZN08gcBlEyL2Hq2n-oDk588w&s=10"} alt={destination.title} className="w-20 h-20 rounded-xl object-cover shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{destination.category}</p>
        <h3 className="font-bold text-foreground text-base line-clamp-1">{destination.title}</h3>
        <p className="text-xs text-muted-foreground">{destination.location}</p>
        <p className="text-sm font-bold text-primary-foreground mt-1">Rp {destination.priceMin.toLocaleString("id-ID")}/orang</p>
      </div>
    </div>
  );
}
