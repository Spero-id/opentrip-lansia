"use client";

import { useState } from "react";
import { useReferralHistory } from "@/features/profile";
import {
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: LucideIcon }> = {
  pending: {
    label: "Menunggu",
    color: "text-warning-600",
    bg: "bg-warning-50",
    icon: Clock,
  },
  converted: {
    label: "Tercatat",
    color: "text-success-600",
    bg: "bg-success-50",
    icon: CheckCircle,
  },
  paid: {
    label: "Dibayar",
    color: "text-info-600",
    bg: "bg-info-50",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Dibatalkan",
    color: "text-destructive-600",
    bg: "bg-destructive-50",
    icon: XCircle,
  },
};

export default function ReferralHistory() {
  const [page, setPage] = useState(1);
  const { history, pagination, loading } = useReferralHistory(page);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateStr: string | Date) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    return `Rp ${(amount ?? 0).toLocaleString("id-ID")}`;
  };

  if (loading && history.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <h2 className="text-base font-bold text-foreground">History Referral</h2>
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse flex gap-3 p-3 rounded-xl bg-muted"
            >
              <div className="h-10 w-10 rounded-full bg-border" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-border rounded w-1/3" />
                <div className="h-3 bg-border rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
      <h2 className="text-base font-bold text-foreground">History Referral</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Daftar orang yang menggunakan kode referral kamu.
      </p>

      {history.length === 0 ? (
        <div className="mt-6 py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Clock size={20} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Belum ada referral</p>
          <p className="text-xs text-muted-foreground mt-1">
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
                className="border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary-foreground/90">
                      {(item.referredUserName ?? "U").charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {item.referredUserName ?? "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.tripName ?? "-"} · {formatDate(item.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${status.color} ${status.bg}`}
                  >
                    <status.icon size={12} />
                    {status.label}
                  </span>

                  {isExpanded ? (
                    <ChevronUp size={16} className="text-muted-foreground" />
                  ) : (
                    <ChevronDown size={16} className="text-muted-foreground" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-border bg-muted">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">Kode Booking</p>
                        <p className="font-semibold text-foreground">
                          {item.bookingCode ?? "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Trip</p>
                        <p className="font-semibold text-foreground">
                          {item.tripName ?? "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Komisi</p>
                        <p className="font-semibold text-foreground">
                          {formatCurrency(item.commissionAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status Komisi</p>
                        <p className="font-semibold text-foreground">
                          {item.commissionStatus ?? "Belum ada"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-3">
              <p className="text-xs text-muted-foreground">
                Halaman {pagination.page} dari {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted text-muted-foreground hover:bg-border disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() =>
                    setPage(Math.min(pagination.totalPages, page + 1))
                  }
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted text-muted-foreground hover:bg-border disabled:opacity-40 disabled:cursor-not-allowed"
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
