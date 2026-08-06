import { A } from "./helpers/constants";
import { Star } from "lucide-react";
import { formatRupiah } from "./helpers/helpers";

export default function DestinationCard({
  dest,
  onSelect,
}) {
  const title = dest.title || dest.name || "Destinasi";
  const rating = typeof dest.rating === "number" ? dest.rating.toFixed(1) : "4.8";

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
      {dest.image ? (
        <img
          src={dest.image}
          alt={title}
          className="w-12 h-12 rounded-xl object-cover shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center shrink-0 text-gray-400 font-bold text-xs">
          {title.slice(0, 2).toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 truncate leading-snug">
          {title}
        </p>
        <p className="text-[10px] text-gray-400 truncate mt-0.5">
          {dest.location || "Indonesia"}
        </p>
        <p
          className="text-[10px] font-semibold mt-0.5"
          style={{ color: A }}
        >
          <Star className="w-3 h-3 fill-current inline" /> {rating} · {formatRupiah(dest.priceMin)}
        </p>
      </div>
    </button>
  );
}

