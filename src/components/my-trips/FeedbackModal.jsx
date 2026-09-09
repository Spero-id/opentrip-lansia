"use client";

import { useState } from "react";

export default function FeedbackModal({ open, onClose, onSubmit, tripTitle, bookingCode }) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      alert("Mohon isi ulasan Anda");
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ rating, content: content.trim() });
      setContent("");
      setRating(5);
    } catch (err) {
      console.error("Error submitting feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#F49D1A]/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#F49D1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Beri Ulasan</h2>
          <p className="text-sm text-slate-500 mt-1">
            {tripTitle}
          </p>
          {bookingCode && (
            <p className="text-xs text-slate-400 mt-1">
              Kode Booking: {bookingCode}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating Stars */}
          <div className="text-center">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Rating
            </label>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="p-1 transition transform hover:scale-110"
                >
                  <svg
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoveredStar || rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-300"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-600 mt-2">
              {rating === 5 ? "Sangat Bagus!" : rating === 4 ? "Bagus" : rating === 3 ? "Cukup" : rating === 2 ? "Kurang" : "Sangat Kurang"}
            </p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ulasan Anda
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Ceritakan pengalaman Anda selama perjalanan..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A] resize-none"
              maxLength={2000}
            />
            <p className="text-xs text-slate-400 mt-1 text-right">
              {content.length}/2000
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Nanti Saja
            </button>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="flex-1 rounded-xl bg-[#F49D1A] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-[#F49D1A]/20 hover:bg-[#c47d12] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Mengirim..." : "Kirim Ulasan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
