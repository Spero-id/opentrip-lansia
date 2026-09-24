"use client";

import { useEffect, useState } from "react";
import { Star, User } from "lucide-react";

function StarDisplay({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          className={s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}
        />
      ))}
    </div>
  );
}

function getInitial(name) {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function ReviewsSection({ tripId }) {
  const [reviews, setReviews] = useState([]);
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
      <div className="py-10 text-center text-sm text-gray-400">Memuat ulasan...</div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-12 text-center rounded-2xl border border-dashed border-gray-200 bg-gray-50">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#F49D1A]/10 flex items-center justify-center mb-3">
          <Star size={22} className="text-[#F49D1A]" />
        </div>
        <p className="text-sm font-semibold text-gray-700">Belum ada ulasan</p>
        <p className="text-xs text-gray-400 mt-1">
          Jadilah yang pertama memberikan ulasan setelah perjalanan.
        </p>
      </div>
    );
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">{Number(avgRating).toFixed(1)}</span>
          <span className="text-sm text-gray-400">/ 5</span>
        </div>
        <div>
          <StarDisplay rating={Math.round(avgRating)} />
          <p className="text-xs text-gray-400 mt-1">{reviews.length} ulasan terverifikasi</p>
        </div>
      </div>

      {/* Review cards */}
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#F49D1A]/15 text-[#F49D1A] flex items-center justify-center text-sm font-bold shrink-0">
                  {getInitial(r.userName)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.userName || "Pengguna"}</p>
                  <p className="text-xs text-gray-400">{formatDate(r.createdAt)}</p>
                </div>
              </div>
              <StarDisplay rating={r.rating} />
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{r.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
