"use client";

import { useState, useEffect } from "react";
import { useAdminTable } from "@/features/admin";
import { Search, Users, Loader2, Settings, Save, Check } from "lucide-react";

interface ReferralRecord {
  id: string;
  referrerName: string;
  referrerEmail: string;
  referredUserName: string;
  referredUserEmail: string;
  bookingCode: string | null;
  tripTitle: string | null;
  status: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-warning-100 text-warning-700",
  converted: "bg-success-100 text-success-700",
  paid: "bg-secondary/15 text-secondary-foreground",
};

function formatDate(val: string | null | undefined): string {
  if (!val) return "-";
  const d = new Date(val);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminReferralHistoryPage() {
  const [rows, setRows] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [bonusPoints, setBonusPoints] = useState<number>(10000);
  const [bonusPointsInput, setBonusPointsInput] = useState("10000");
  const [savingBonus, setSavingBonus] = useState(false);
  const [bonusSaved, setBonusSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/referrals/history");
        const data = await res.json();
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/site-settings/referral-bonus");
        const data = await res.json();
        if (!cancelled && data.referralBonusPoints !== undefined) {
          setBonusPoints(data.referralBonusPoints);
          setBonusPointsInput(String(data.referralBonusPoints));
        }
      } catch {
      }
    }
    loadSettings();
    return () => { cancelled = true; };
  }, []);

  async function handleSaveBonus() {
    const numVal = parseInt(bonusPointsInput, 10);
    if (isNaN(numVal) || numVal < 0) return;
    setSavingBonus(true);
    setBonusSaved(false);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "referral_bonus_points", value: numVal }),
      });
      if (res.ok) {
        setBonusPoints(numVal);
        setBonusSaved(true);
        setTimeout(() => setBonusSaved(false), 2000);
      }
    } catch {
    } finally {
      setSavingBonus(false);
    }
  }

  const { query: search, setQuery: setSearch, filtered } = useAdminTable(rows, {
    searchKeys: ["referrerName", "referrerEmail", "referredUserName", "referredUserEmail", "bookingCode", "tripTitle"],
  });

  const totalReferrals = rows.length;
  const converted = rows.filter((r) => r.status === "converted" || r.status === "paid").length;
  const pending = rows.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-6 rounded-3xl border border-border/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            History Referral
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Lihat siapa yang menggunakan referral siapa.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/80 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-bold text-foreground">Pengaturan Referral</h2>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Bonus Poin per Referral
            </label>
            <input
              type="number"
              min={0}
              value={bonusPointsInput}
              onChange={(e) => setBonusPointsInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Poin yang diberikan ke akun referrer saat referral berhasil (status Berhasil)
            </p>
          </div>
          <button
            onClick={handleSaveBonus}
            disabled={savingBonus}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition"
          >
            {savingBonus ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : bonusSaved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {bonusSaved ? "Tersimpan!" : "Simpan"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border/80 p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Total Referral</p>
          <p className="text-2xl font-bold text-foreground mt-1">{totalReferrals}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/80 p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Converted</p>
          <p className="text-2xl font-bold text-success-600 mt-1">{converted}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/80 p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Pending</p>
          <p className="text-2xl font-bold text-warning-600 mt-1">{pending}</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/80 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama, email, kode booking, atau trip..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted text-muted-foreground font-semibold border-b border-border/80">
              <tr>
                <th className="px-6 py-4">Pemberi Referral</th>
                <th className="px-6 py-4">Pengguna Referral</th>
                <th className="px-6 py-4">Trip</th>
                <th className="px-6 py-4">Kode Booking</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Memuat data...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      {search ? "Tidak ada data yang cocok" : "Belum ada data referral"}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/60 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-foreground">{r.referrerName}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{r.referrerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-foreground">{r.referredUserName}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{r.referredUserEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-foreground">{r.tripTitle || "-"}</p>
                    </td>
                    <td className="px-6 py-4">
                      {r.bookingCode ? (
                        <span className="font-mono font-bold text-primary-foreground text-xs">
                          {r.bookingCode}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          STATUS_STYLES[r.status] || "bg-muted text-muted-foreground"
                        }`}
                      >
                        {r.status === "converted"
                          ? "Berhasil"
                          : r.status === "paid"
                          ? "Dibayar"
                          : r.status === "pending"
                          ? "Menunggu"
                          : r.status}
                        {r.status === "converted" && bonusPoints > 0 && (
                          <span className="ml-1 text-[9px] font-normal opacity-70">
                            +{bonusPoints.toLocaleString("id-ID")} poin
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(r.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
