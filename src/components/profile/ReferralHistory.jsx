"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const statusConfig = {
  pending: {
    label: "Menunggu",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    icon: Clock,
  },
  converted: {
    label: "Tercatat",
    color: "text-green-600",
    bg: "bg-green-50",
    icon: CheckCircle,
  },
  paid: {
    label: "Dibayar",
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Dibatalkan",
    color: "text-red-600",
    bg: "bg-red-50",
    icon: XCircle,
  },
};

export default function ReferralHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/user/referral/history?page=${page}&limit=10`
        );
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setHistory(data.history);
            setPagination(data.pagination);
          }
        }
      } catch (err) {
        console.error("Failed to fetch referral history:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchHistory();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `Rp ${(amount ?? 0).toLocaleString("id-ID")}`;
  };

  if (loading && history.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <h2 className="text-base font-bold text-slate-900">History Referral</h2>
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse flex gap-3 p-3 rounded-xl bg-slate-50"
            >
              <div className="h-10 w-10 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <h2 className="text-base font-bold text-slate-900">History Referral</h2>
      <p className="mt-0.5 text-xs text-slate-400">
        Daftar orang yang menggunakan kode referral kamu.
      </p>

      {history.length === 0 ? (
        <div className="mt-6 py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Clock size={20} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">Belum ada referral</p>
          <p className="text-xs text-slate-400 mt-1">
            Bagikan kode referral kamu untuk mulai mendapat komisi!
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {history.map((item) => {
            const status = statusConfig[item.status] ?? statusConfig.pending;
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="border border-slate-100 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-[#FEF6E7] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#c47d12]">
                      {(item.referredUserName ?? "U").charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {item.referredUserName ?? "User"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {item.tripName ?? "-"} · {formatDate(item.createdAt)}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${status.color} ${status.bg}`}
                  >
                    <status.icon size={12} />
                    {status.label}
                  </span>

                  {/* Expand Icon */}
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-400" />
                  )}
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-100 bg-slate-50">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-slate-500">Kode Booking</p>
                        <p className="font-semibold text-slate-900">
                          {item.bookingCode ?? "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Trip</p>
                        <p className="font-semibold text-slate-900">
                          {item.tripName ?? "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Komisi</p>
                        <p className="font-semibold text-slate-900">
                          {formatCurrency(item.commissionAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Status Komisi</p>
                        <p className="font-semibold text-slate-900">
                          {item.commissionStatus ?? "Belum ada"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-3">
              <p className="text-xs text-slate-400">
                Halaman {pagination.page} dari {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() =>
                    setPage(Math.min(pagination.totalPages, page + 1))
                  }
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
