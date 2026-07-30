"use client";

import { MapPin } from "lucide-react";

export default function MeetingPointSelector({ meetingPointId, onChange }) {
  const points = [
    { id: "hotel_pickup", label: "Hotel Pickup", desc: "Dijemput langsung di hotel Anda", cost: "+Rp 150.000" },
    { id: "main_office", label: "Kantor Pusat", desc: "Jl. Raya Kuta No. 88, Bali", cost: "Gratis" },
    { id: "airport", label: "Bandara Ngurah Rai", desc: "Terminal Kedatangan Internasional", cost: "+Rp 200.000" },
    { id: "seminyak", label: "Seminyak Square", desc: "Area Seminyak, Bali Selatan", cost: "+Rp 75.000" },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3 shadow-sm">
      <h2 className="text-base font-bold text-gray-900">Meeting Point</h2>
      <div className="space-y-2">
        {points.map((p) => (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
              meetingPointId === p.id
                ? "border-[#F49D1A] bg-[#F49D1A]/5"
                : "border-gray-100 hover:border-gray-200"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              meetingPointId === p.id ? "bg-[#F49D1A] text-white" : "bg-gray-100 text-gray-500"
            }`}>
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{p.label}</p>
              <p className="text-xs text-gray-500">{p.desc}</p>
            </div>
            <span className={`text-xs font-semibold shrink-0 ${
              p.cost === "Gratis" ? "text-[#1CA6B7]" : "text-gray-500"
            }`}>
              {p.cost}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
