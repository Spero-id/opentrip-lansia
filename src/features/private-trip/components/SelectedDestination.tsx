import { Star, Heart, X } from "lucide-react";
import { formatIDR } from "@/utils/format";
import type { PrivateTripDestination } from "@/features/private-trip/types";

export default function SelectedDestination({
  destination,
  onClear,
}: {
  destination: PrivateTripDestination;
  onClear?: () => void;
}) {
  const title = destination.title || destination.name || "Destinasi";
  const rating = typeof destination.rating === "number" ? destination.rating.toFixed(1) : null;

  return (
    <div
      className="flex items-stretch gap-0 rounded-xl border border-border bg-card text-left overflow-hidden"
    >
      {destination.image ? (
        <img
          src={destination.image}
          alt={title}
          className="w-32 self-stretch object-cover shrink-0"
        />
      ) : (
        <div className="w-32 self-stretch bg-border flex items-center justify-center shrink-0 text-muted-foreground font-bold text-xs">
          {title.slice(0, 2).toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col gap-2 p-4 pl-3">
        <p className="text-[13px] font-bold text-foreground truncate">
          {title}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {destination.location || "Indonesia"}
        </p>
        <p
          className="text-xs font-semibold flex items-center gap-1.5"
          style={{ color: "var(--primary-foreground)" }}
        >
          {rating ? (
            <>
              <Star className="w-3.5 h-3.5 fill-current shrink-0" />
              <span>{rating}</span>
              <span>·</span>
            </>
          ) : (
            <span className="font-medium text-muted-foreground">Belum ada ulasan</span>
          )}
          <span>{formatIDR(destination.priceMin)}</span>
        </p>
        {destination.isSeniorFriendly && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-success-800 bg-success-50 border border-success-200 w-fit">
            <Heart size={10} className="fill-success-500 text-success-500 shrink-0" />
            Ramah Lansia
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onClear}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive-400 hover:bg-destructive-50 transition-colors shrink-0 my-4 mr-4"
      >
        <X size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}
