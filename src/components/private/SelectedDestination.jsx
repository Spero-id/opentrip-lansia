import { A } from "./helpers/constants";
import { Star, Heart } from "lucide-react";
import { formatRupiah } from "./helpers/helpers";

export default function SelectedDestination({
  destination,
  onClear,
}) {
  const title = destination.title || destination.name || "Destinasi";
  const rating = typeof destination.rating === "number" ? destination.rating.toFixed(1) : "5.0";

  return (
    <div
      className="flex items-stretch gap-0 rounded-xl border border-[#E5E7EB] bg-white text-left overflow-hidden"
    >
      {destination.image ? (
        <img
          src={destination.image}
          alt={title}
          className="w-32 self-stretch object-cover shrink-0"
        />
      ) : (
        <div className="w-32 self-stretch bg-gray-200 flex items-center justify-center shrink-0 text-gray-400 font-bold text-xs">
          {title.slice(0, 2).toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col gap-2 p-4 pl-3">
        <p className="text-[13px] font-bold text-[#1F2A37] truncate">
          {title}
        </p>
        <p className="text-xs text-[#6B7280] truncate">
          {destination.location || "Indonesia"}
        </p>
        <p
          className="text-xs font-semibold flex items-center gap-1.5"
          style={{ color: A }}
        >
          <Star className="w-3.5 h-3.5 fill-current shrink-0" />
          <span>{rating}</span>
          <span>·</span>
          <span>{formatRupiah(destination.priceMin)}</span>
        </p>
        {destination.isSeniorFriendly && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] w-fit">
            <Heart size={10} className="fill-[#10B981] text-[#10B981] shrink-0" />
            Ramah Lansia
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onClear}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-red-400 hover:bg-red-50 transition-colors shrink-0 my-4 mr-4"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
