"use client";

import { Clock, MapPin } from "lucide-react";
import type { DestinationSummary } from "@/features/checkout";

export default function MeetingPointInfo({ destination }: { destination?: DestinationSummary | null }) {
  const points = destination?.meetingPoints || [];

  if (points.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
        <h2 className="text-base font-bold text-foreground">Meeting Point</h2>
        <p className="text-sm text-muted-foreground">Meeting point akan diinformasikan oleh admin setelah booking dikonfirmasi.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
      <h2 className="text-base font-bold text-foreground">Meeting Point</h2>

      <div className="relative">
        <ol className="space-y-5">
          {points.map((point, idx) => (
            <li key={idx} className="relative">
              <div className="rounded-2xl border border-border bg-muted p-4 sm:p-5">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
                    <Clock size={13} />
                    Kumpul Pukul
                  </span>
                  <span className="rounded-full bg-card px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {point.time}
                  </span>
                </div>
                <h4 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <MapPin size={15} className="shrink-0 text-primary-foreground" />
                  {point.location}
                </h4>
                {point.description && (
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {point.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
