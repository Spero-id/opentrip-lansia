"use client";

import Link from "next/link";
import { Luggage } from "lucide-react";

export default function EmptyState({ type }: { type: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Luggage className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-muted-foreground mb-1">
        {type === "open" ? "Belum ada booking open trip" : "Belum ada request private trip"}
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        {type === "open"
          ? "Mulai jelajahi destinasi dan buat booking pertama Anda"
          : "Ajukan request private trip untuk rombongan Anda"}
      </p>
      <Link
        href={type === "open" ? "/trips" : "/private-trip"}
        className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition"
      >
        {type === "open" ? "Lihat Destinasi" : "Buat Request"}
      </Link>
    </div>
  );
}
