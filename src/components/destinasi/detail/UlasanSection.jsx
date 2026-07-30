"use client";

import { useState } from "react";

const A = "#F49D1A";

export default function UlasanSection({ dest }) {
  const [ratingFilter, setRatingFilter] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const filteredReviews = ratingFilter
    ? dest.reviewsList?.filter(r => Math.floor(r.rating) === ratingFilter)
    : dest.reviewsList;

  const displayedReviews = showAllReviews ? filteredReviews : filteredReviews?.slice(0, 2);

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-gray-900">
          <span className="w-1.5 h-6 sm:w-2 sm:h-8 rounded-full" style={{ backgroundColor: A }}></span>
          Ulasan Pengunjung
        </h2>
        <div className="flex items-center gap-2 text-sm font-semibold overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => setRatingFilter(null)}
            className={`px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
              ratingFilter === null
                ? 'bg-[#F49D1A] text-white border-[#F49D1A]'
                : 'bg-white text-gray-500 border-gray-200 hover:border-[#F49D1A]'
            }`}
          >
            Semua
          </button>
          {[5, 4, 3, 2, 1].map(star => (
            <button
              key={star}
              onClick={() => setRatingFilter(star)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                ratingFilter === star
                  ? 'bg-[#F49D1A] text-white border-[#F49D1A]'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-[#F49D1A]'
              }`}
            >
              {star} <span className={ratingFilter === star ? "text-white" : "text-[#F49D1A]"}>★</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {displayedReviews?.length > 0 ? displayedReviews.map((review, i) => (
          <div key={i} className="p-4 sm:p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-xs sm:text-base">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm sm:text-base text-gray-900">{review.author}</div>
                  <div className="text-[11px] sm:text-xs text-gray-400">{review.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-[#FEF6E7] px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg">
                <span className="text-[#F49D1A] font-bold text-xs sm:text-sm">★</span>
                <span className="font-bold text-xs sm:text-sm text-gray-900">{review.rating.toFixed(1)}</span>
              </div>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3">&ldquo;{review.comment}&rdquo;</p>
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {review.images.map((img, j) => (
                  <img key={j} src={img} alt={`Review ${review.author}`} className="h-16 sm:h-20 w-16 sm:w-20 object-cover rounded-xl border border-gray-100" />
                ))}
              </div>
            )}
          </div>
        )) : (
          <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-gray-400">
            Belum ada ulasan untuk filter ini.
          </div>
        )}
      </div>

      {filteredReviews?.length > 2 && (
        <button
          onClick={() => setShowAllReviews(!showAllReviews)}
          className="mt-4 w-full py-2.5 sm:py-3 rounded-xl border border-gray-200 font-semibold text-xs sm:text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          {showAllReviews ? "Tampilkan lebih sedikit" : `Tampilkan semua ulasan (${filteredReviews.length})`}
        </button>
      )}
    </section>
  );
}
