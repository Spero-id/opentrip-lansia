"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatIDR } from "@/utils/format";
import { Calendar } from "lucide-react";

const A = "var(--primary)";

const QUOTA_MAX = 10;
const MIN_TO_GO = 6;

function formatDate(val?: string | null) {
  if (!val) return "-";
  const [y, m, d] = val.slice(0, 10).split("-");
  if (!y || !m || !d) return val;
  return `${d}-${m}-${y}`;
}

import type { TripDetail } from "@/features/trip/types";

function QuotaStatus({ booked }: { booked: number }) {
  if (booked >= QUOTA_MAX) {
    return <span className="rounded-full bg-destructive-100 px-2.5 py-1 text-[10px] font-bold text-destructive-600">Kuota Penuh</span>;
  }
  if (booked >= MIN_TO_GO) {
    return <span className="rounded-full bg-success-100 px-2.5 py-1 text-[10px] font-bold text-success-600">To Go</span>;
  }
  return <span className="rounded-full bg-warning-100 px-2.5 py-1 text-[10px] font-bold text-warning-600">Menunggu Kuota</span>;
}

export default function BookingCard({ dest }: { dest: TripDetail }) {
  const activeGroup = dest.activeGroup || null;
  const [boundedTiers, setBoundedTiers] = useState<Array<{ name: string; validUntil: string | null }>>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/trips/${dest.id}/tiers`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data || !Array.isArray(data.tiers)) return;
        setBoundedTiers(
          data.tiers
            .filter((t: { validUntil?: string | null }) => t.validUntil)
            .map((t: { name: string; validUntil: string | null }) => ({ name: t.name, validUntil: t.validUntil })),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [dest.id]);
  const bookedCount = activeGroup?.quotaBooked ?? (typeof dest.bookedCount === "number" ? dest.bookedCount : null);
  const maxQuota = activeGroup?.maxParticipants ?? QUOTA_MAX;
  const remaining = bookedCount === null ? null : Math.max(maxQuota - bookedCount, 0);

  return (
    <div className="sticky top-28 bg-card p-6 rounded-3xl shadow-xl border border-border flex flex-col gap-6">
      <div className="pb-6 border-b border-border">
        <div className="text-sm text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Mulai dari</div>
        <div className="text-3xl font-bold" style={{ color: "var(--primary-foreground)" }}>
          {formatIDR(dest.priceMin)}
        </div>
        <div className="text-sm text-muted-foreground mt-1">per orang / pax</div>
        {boundedTiers.length > 0 && (
          <p className="text-[11px] font-semibold text-primary-foreground mt-1.5">
            {boundedTiers.map((t) => `${t.name} s/d ${formatDate(t.validUntil)}`).join(" · ")}
          </p>
        )}
      </div>

      {activeGroup && (
        <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-secondary-foreground" />
            <span className="text-sm font-bold text-secondary-foreground">Jadwal Aktif</span>
          </div>
          <div className="text-sm font-semibold text-foreground">
            {formatDate(activeGroup.startDate)}
            {activeGroup.endDate && activeGroup.endDate !== activeGroup.startDate && (
              <span className="text-muted-foreground"> s/d {formatDate(activeGroup.endDate)}</span>
            )}
          </div>
        </div>
      )}

      {bookedCount !== null && (
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Kuota Tersedia</span>
            <QuotaStatus booked={bookedCount} />
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min((bookedCount / maxQuota) * 100, 100)}%`,
                backgroundColor: A,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs font-semibold text-muted-foreground">
            <span>Sudah booking {bookedCount} orang</span>
            <span>Tinggal {remaining} slot</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Minimal {MIN_TO_GO} peserta agar trip berangkat.
          </p>
        </div>
      )}

      <div className="pt-2">
        {activeGroup ? (
          <Link href={`/checkout?destination=${dest.id}`} className="block w-full">
            <button
              className="w-full py-3.5 rounded-xl text-primary-foreground font-semibold text-base shadow-sm hover:shadow-lg transition-all cursor-pointer"
              style={{ backgroundColor: A }}
            >
              Pesan Sekarang
            </button>
          </Link>
        ) : (
          <button
            disabled
            className="w-full py-3.5 rounded-xl text-muted-foreground bg-muted font-semibold text-base cursor-not-allowed"
          >
            Belum Ada Jadwal
          </button>
        )}
        <p className="text-center text-xs text-muted-foreground mt-4">Belum dipungut biaya saat ini.</p>
      </div>

      <div className="mt-2 pt-4 border-t border-border grid grid-cols-2 gap-3 text-xs font-semibold text-muted-foreground">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-foreground"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Bebas Reschedule
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-foreground"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Pemandu Lokal
        </div>
      </div>
    </div>
  );
}
