import { A } from "./helpers/constants";
import { formatRupiah } from "./helpers/helpers";

export default function DestinationCard({
  dest,
  selected,
  onSelect,
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:border-[#F49D1A] hover:bg-[#F49D1A08]"
      style={{
        borderColor: "#e5e7eb",
        backgroundColor: "#f9fafb",
      }}
    >
      <img
        src={dest.image}
        alt={dest.title}
        className="w-12 h-12 rounded-xl object-cover shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 truncate leading-snug">
          {dest.title}
        </p>
        <p className="text-[10px] text-gray-400 truncate mt-0.5">
          {dest.location}
        </p>
        <p
          className="text-[10px] font-semibold mt-0.5"
          style={{ color: A }}
        >
          * {dest.rating.toFixed(1)} · {formatRupiah(dest.priceMin)}
        </p>
      </div>
    </button>
  );
}
