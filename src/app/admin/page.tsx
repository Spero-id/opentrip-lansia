"use client";

import Link from "next/link";
import { Compass, Calendar, DollarSign, TrendingUp, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalTrips: number;
  bookingThisMonth: number;
  bookingChange: number | null;
  revenue: string;
  activePromos: number;
}

interface RecentBooking {
  id: string;
  bookingCode: string;
  status: string;
  totalAmount: string;
  currency: string;
  bookingDate: string;
  customerName: string;
  tripName: string;
}

function formatStatus(status: string): { label: string; className: string } {
  switch (status) {
    case "confirmed":
      return { label: "Terkonfirmasi", className: "bg-[#1CA6B7]/15 text-[#1CA6B7]" };
    case "completed":
      return { label: "Selesai", className: "bg-green-100 text-green-700" };
    case "cancelled":
      return { label: "Dibatalkan", className: "bg-red-100 text-red-700" };
    case "pending":
    default:
      return { label: "Pending", className: "bg-amber-100 text-amber-800" };
  }
}

function formatRupiah(value: string): string {
  const num = Number(value);
  if (isNaN(num)) return value;
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)}M`;
  if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(1)}Jt`;
  return `Rp ${num.toLocaleString("id-ID")}`;
}

function StatCardSkeleton() {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-32 bg-slate-200 rounded" />
        <div className="w-10 h-10 rounded-2xl bg-slate-200" />
      </div>
      <div>
        <div className="h-7 w-24 bg-slate-200 rounded mb-2" />
        <div className="h-3 w-20 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStats(data.stats);
        setRecentBookings(data.recentBookings ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        {
          label: "Total Destinasi & Trip",
          value: String(stats.totalTrips),
          change: "Total aktif",
          icon: Compass,
          color: "text-[#F49D1A]",
          bg: "bg-[#FEF6E7]",
        },
        {
          label: "Pemesanan Bulan Ini",
          value: String(stats.bookingThisMonth),
          change:
            stats.bookingChange === null
              ? "Bulan ini"
              : stats.bookingChange >= 0
              ? `+${stats.bookingChange}% vs bln lalu`
              : `${stats.bookingChange}% vs bln lalu`,
          icon: Calendar,
          color: "text-[#1CA6B7]",
          bg: "bg-[#1CA6B7]/10",
        },
        {
          label: "Total Pendapatan",
          value: stats.revenue,
          change: "Booking confirmed & selesai",
          icon: DollarSign,
          color: "text-blue-600",
          bg: "bg-blue-50",
        },
        {
          label: "Promo Aktif",
          value: String(stats.activePromos),
          change: "Kode promo aktif",
          icon: TrendingUp,
          color: "text-purple-600",
          bg: "bg-purple-50",
        },
      ]
    : null;

  return (
    <div className="space-y-8">
      {/* Dashboard Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Selamat datang di panel admin Jelajah Memoria. Pantau performa bisnis dan pengelolaan destinasi secara real-time.
          </p>
        </div>
        <Link
          href="/admin/trips"
          className="rounded-2xl bg-[#F49D1A] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#F49D1A]/20 hover:bg-[#c47d12] transition inline-flex items-center gap-2 shrink-0"
        >
          <span>+ Buat Trip Baru</span>
        </Link>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl">
          Gagal memuat data dashboard: {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading || !statCards
          ? Array.from({ length: 4 }).map((_, idx) => <StatCardSkeleton key={idx} />)
          : statCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">{stat.label}</span>
                    <div className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <span className="text-2xl font-extrabold text-slate-900">{stat.value}</span>
                    <span className="block text-[11px] font-semibold text-[#1CA6B7] mt-1">{stat.change}</span>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Recent Bookings & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Table Recent Bookings */}
        <div className="lg:col-span-8 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Pemesanan Terbaru</h2>
            <Link href="/admin/pesanan" className="text-xs font-semibold text-[#F49D1A] hover:underline flex items-center gap-1">
              <span>Lihat Semua</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Kode Booking</th>
                  <th className="px-4 py-3">Pemesan</th>
                  <th className="px-4 py-3">Paket Trip</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-3 bg-slate-200 rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      Belum ada pemesanan.
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((row) => {
                    const { label, className } = formatStatus(row.status);
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{row.bookingCode}</td>
                        <td className="px-4 py-3 font-medium">{row.customerName}</td>
                        <td className="px-4 py-3 text-slate-500">{row.tripName}</td>
                        <td className="px-4 py-3 font-bold text-[#F49D1A]">{formatRupiah(row.totalAmount)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${className}`}>
                            {label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="lg:col-span-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Aksi Cepat</h2>

          <div className="space-y-3 text-xs">
            <Link
              href="/admin/trips"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-[#F49D1A]/10 hover:border-[#F49D1A]/20 border border-slate-100 transition group"
            >
              <span className="font-semibold text-slate-800 group-hover:text-[#F49D1A]">Kelola Paket Trip</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#F49D1A]" />
            </Link>
            <Link
              href="/admin/trips"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-[#F49D1A]/10 hover:border-[#F49D1A]/20 border border-slate-100 transition group"
            >
              <span className="font-semibold text-slate-800 group-hover:text-[#F49D1A]">Tambah Trip Baru</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#F49D1A]" />
            </Link>
            <Link
              href="/admin/promotions"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-[#F49D1A]/10 hover:border-[#F49D1A]/20 border border-slate-100 transition group"
            >
              <span className="font-semibold text-slate-800 group-hover:text-[#F49D1A]">Buat Kode Kupon / Promo</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#F49D1A]" />
            </Link>
            <Link
              href="/admin/pesanan"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-[#F49D1A]/10 hover:border-[#F49D1A]/20 border border-slate-100 transition group"
            >
              <span className="font-semibold text-slate-800 group-hover:text-[#F49D1A]">Lihat Semua Pemesanan</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#F49D1A]" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
