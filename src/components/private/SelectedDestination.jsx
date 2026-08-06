import { A } from "./helpers/constants";
import { Star } from "lucide-react";
import { formatRupiah } from "./helpers/helpers";

export default function SelectedDestination({
  destination,
  onClear,
}) {
  const title = destination.title || destination.name || "Destinasi";
  const rating = typeof destination.rating === "number" ? destination.rating.toFixed(1) : "4.8";

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl border"
      style={{
        borderColor: `${A}40`,
        backgroundColor: `${A}08`,
      }}
    >
      {destination.image ? (
        <img
          src={destination.image}
          alt={title}
          className="w-14 h-14 rounded-xl object-cover shrink-0"
        />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center shrink-0 text-gray-400 font-bold text-xs">
          {title.slice(0, 2).toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 truncate">
          {title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {destination.location || "Indonesia"}
        </p>
        <p
          className="text-xs font-semibold mt-0.5"
          style={{ color: A }}
        >
          <Star className="w-3 h-3 fill-current inline" /> {rating}
          &nbsp;·&nbsp;
          mulai {formatRupiah(destination.priceMin)}
        </p>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

