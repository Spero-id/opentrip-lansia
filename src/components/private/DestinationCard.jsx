import { A } from "./helpers/constants";
import { Star, Heart } from "lucide-react";
import { formatRupiah } from "./helpers/helpers";

export default function DestinationCard({
  dest,
  onSelect,
}) {
  const title = dest.title || dest.name || "Destinasi";
  const rating = typeof dest.rating === "number" ? dest.rating.toFixed(1) : "5.0";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full flex items-stretch gap-0 rounded-xl border border-[#E5E7EB] bg-white text-left transition-colors hover:border-[#F49D1A] hover:bg-[#FFFBEB] cursor-pointer overflow-hidden"
    >
      {dest.image ? (
        <img
          src={dest.image}
          alt={title}
          className="w-32 self-stretch object-cover shrink-0"
        />
      ) : (
        <div className="w-32 self-stretch bg-gray-200 flex items-center justify-center shrink-0 text-gray-400 font-bold text-xs">
          {title.slice(0, 2).toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col gap-2 p-4 pl-3">
        <p className="text-[13px] font-bold text-[#1F2A37] leading-tight truncate">
          {title}
        </p>
        <p className="text-xs text-[#6B7280] leading-none truncate">
          {dest.location || "Indonesia"}
        </p>
        <p
          className="text-xs font-semibold flex items-center gap-1.5"
          style={{ color: A }}
        >
          <Star className="w-3.5 h-3.5 fill-current shrink-0" />
          <span>{rating}</span>
          <span>·</span>
          <span>{formatRupiah(dest.priceMin)}</span>
        </p>
        {dest.isSeniorFriendly && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] w-fit">
            <Heart size={10} className="fill-[#10B981] text-[#10B981] shrink-0" />
            Ramah Lansia
          </span>
        )}
      </div>
    </button>
  );
}
