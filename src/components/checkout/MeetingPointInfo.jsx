"use client";

import { Clock, MapPin } from "lucide-react";

export default function MeetingPointInfo({ destination }) {
  const point = destination?.meetingPoints?.length
    ? destination.meetingPoints[0]
    : null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3 shadow-sm">
      <h2 className="text-base font-bold text-gray-900">Meeting Point</h2>

      {!point ? (
        <p className="text-xs text-gray-400">
          Informasi titik kumpul akan dikirim setelah pemesanan kamu dikonfirmasi.
        </p>
      ) : (
        <div className="relative">
          <div
            className="absolute bottom-3 left-4 top-3 w-px bg-slate-200"
            aria-hidden
          />
          <ol className="space-y-5">
            <li className="relative pl-12">
              <span className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#FEF6E7] text-[#c47d12] ring-4 ring-white">
                <Clock size={15} />
              </span>
              <div className="rounded-2xl border border-slate-200 bg-gray-50 p-4 sm:p-5">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-[#F49D1A]">
                    Kumpul Pukul
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-gray-500">
                    {point.time}
                  </span>
                </div>
                <h4 className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                  <MapPin size={15} className="shrink-0 text-[#F49D1A]" />
                  {point.location}
                </h4>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                  {point.description}
                </p>
              </div>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
