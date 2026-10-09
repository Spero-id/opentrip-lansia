"use client";

import type { DestinationSummary } from "@/features/checkout";

export default function BookingCard({ destination }: { destination: DestinationSummary }) {
  return (
    <div className="flex items-center gap-4 bg-gradient-to-br from-muted to-white border border-border rounded-2xl p-4 shadow-sm">
      <img src={destination.image} alt={destination.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{destination.category}</p>
        <h3 className="font-bold text-foreground text-sm line-clamp-1">{destination.title}</h3>
        <p className="text-xs text-muted-foreground">{destination.location}</p>
        <p className="text-sm font-bold text-primary-foreground">Rp {destination.priceMin.toLocaleString("id-ID")}/org</p>
      </div>
    </div>
  );
}
