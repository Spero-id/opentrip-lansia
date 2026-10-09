"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

import type { TripReview } from "@/features/trip/types";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          className={s <= rating ? "text-warning-400 fill-warning-400" : "text-border fill-border"}
        />
      ))}
    </div>
  );
}

function getInitial(name?: string | null) {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function ReviewsSection({ tripId }: { tripId: string }) {
  const [reviews, setReviews] = useState<TripReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) return;
    fetch(`/api/reviews?tripId=${tripId}&status=approved`)
      .then((r) => r.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [tripId]);

  if (loading) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">Memuat ulasan...</div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-12 text-center rounded-2xl border border-dashed border-border bg-muted">
        <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Star size={22} className="text-primary-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground">Belum ada ulasan</p>
        <p className="text-xs text-muted-foreground mt-1">
          Jadilah yang pertama memberikan ulasan setelah perjalanan.
        </p>
      </div>
    );
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const allVerified = reviews.every((r) => r.isVerifiedPurchase);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">{Number(avgRating).toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">/ 5</span>
        </div>
        <div>
          <StarDisplay rating={Math.round(avgRating)} />
          <p className="text-xs text-muted-foreground mt-1">
            {reviews.length} ulasan{allVerified ? " terverifikasi" : ""}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-card rounded-2xl border border-border p-5 shadow-xs">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/15 text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                  {getInitial(r.userName)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{r.userName || "Pengguna"}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
                </div>
              </div>
              <StarDisplay rating={r.rating} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{r.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
