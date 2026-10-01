"use client";

export default function BookingCard({ destination }) {
  return (
    <div className="flex items-center gap-4 bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <img src={destination.image} alt={destination.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{destination.category}</p>
        <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{destination.title}</h3>
        <p className="text-xs text-gray-500">{destination.location}</p>
        <p className="text-sm font-bold text-[#F49D1A]">Rp {destination.priceMin.toLocaleString("id-ID")}/org</p>
      </div>
    </div>
  );
}
