import { Star, Heart } from "lucide-react";
import { formatIDR } from "@/utils/format";
import type { PrivateTripDestination } from "@/features/private-trip/types";

export default function DestinationCard({
  dest,
  onSelect,
}: {
  dest: PrivateTripDestination;
  onSelect?: () => void;
}) {
  const title = dest.title || dest.name || "Destinasi";
  const rating = typeof dest.rating === "number" ? dest.rating.toFixed(1) : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full flex items-stretch gap-0 rounded-xl border border-border bg-card text-left transition-colors hover:border-primary hover:bg-primary/10 cursor-pointer overflow-hidden"
    >
      {dest.image ? (
        <img
          src={dest.image}
          alt={title}
          className="w-32 self-stretch object-cover shrink-0"
        />
      ) : (
        <div className="w-32 self-stretch bg-border flex items-center justify-center shrink-0 text-muted-foreground font-bold text-xs">
          {title.slice(0, 2).toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col gap-2 p-4 pl-3">
        <p className="text-[13px] font-bold text-foreground leading-tight truncate">
          {title}
        </p>
        <p className="text-xs text-muted-foreground leading-none truncate">
          {dest.location || "Indonesia"}
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
          <span>{formatIDR(dest.priceMin)}</span>
        </p>
        {dest.isSeniorFriendly && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-success-800 bg-success-50 border border-success-200 w-fit">
            <Heart size={10} className="fill-success-500 text-success-500 shrink-0" />
            Ramah Lansia
          </span>
        )}
      </div>
    </button>
  );
}
