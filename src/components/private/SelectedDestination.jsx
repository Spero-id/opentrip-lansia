import { A } from "./helpers/constants";
import { formatRupiah } from "./helpers/helpers";

export default function SelectedDestination({
  destination,
  onClear,
}) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl border"
      style={{
        borderColor: `${A}40`,
        backgroundColor: `${A}08`,
      }}
    >
      <img
        src={destination.image}
        alt={destination.title}
        className="w-14 h-14 rounded-xl object-cover shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 truncate">
          {destination.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {destination.location}
        </p>
        <p
          className="text-xs font-semibold mt-0.5"
          style={{ color: A }}
        >
          * {destination.rating.toFixed(1)}
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
