"use client";

export default function BookingSummary({ destination }) {
  if (!destination) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <p className="text-sm text-amber-800 font-semibold">Belum ada destinasi dipilih.</p>
        <p className="text-xs text-amber-600 mt-1">Silakan pilih destinasi terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-4">
      <img src={destination.image} alt={destination.title} className="w-20 h-20 rounded-xl object-cover shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{destination.category}</p>
        <h3 className="font-bold text-gray-900 text-base line-clamp-1">{destination.title}</h3>
        <p className="text-xs text-gray-500">{destination.location}</p>
        <p className="text-sm font-bold text-[#df7224] mt-1">Rp {destination.priceMin.toLocaleString("id-ID")}/orang</p>
      </div>
    </div>
  );
}
