"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Calendar, DollarSign, TrendingUp, ArrowUpRight } from "lucide-react";

interface Stats {
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

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Terkonfirmasi",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
        if (data.recentBookings) setRecentBookings(data.recentBookings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        {
          label: "Total Paket Trip",
          value: String(stats.totalTrips),
          change: "Semua status",
          icon: MapPin,
          color: "text-[#F49D1A]",
          bg: "bg-[#FEF6E7]",
        },
        {
          label: "Pemesanan Bulan Ini",
          value: String(stats.bookingThisMonth),
          change:
            stats.bookingChange === null
              ? "Bulan pertama"
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
          change: "Confirmed & selesai",
          icon: DollarSign,
          color: "text-blue-600",
          bg: "bg-blue-50",
        },
        {
          label: "Promo Aktif",
          value: String(stats.activePromos),
          change: "Saat ini",
          icon: TrendingUp,
          color: "text-purple-600",
          bg: "bg-purple-50",
        },
      ]
    : [
        { label: "Total Paket Trip", value: "—", change: "", icon: MapPin, color: "text-[#F49D1A]", bg: "bg-[#FEF6E7]" },
        { label: "Pemesanan Bulan Ini", value: "—", change: "", icon: Calendar, color: "text-[#1CA6B7]", bg: "bg-[#1CA6B7]/10" },
        { label: "Total Pendapatan", value: "—", change: "", icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Promo Aktif", value: "—", change: "", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
      ];

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
          href="/admin/trips/new"
          className="rounded-2xl bg-[#F49D1A] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#F49D1A]/20 hover:bg-[#c47d12] transition inline-flex items-center gap-2 shrink-0"
        >
          <span>+ Buat Trip Baru</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{stat.label}</span>
                <div className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className={`text-2xl font-extrabold text-slate-900 ${loading ? "animate-pulse text-slate-300" : ""}`}>
                  {stat.value}
                </span>
                {stat.change && (
                  <span className="block text-[11px] font-semibold text-[#1CA6B7] mt-1">{stat.change}</span>
                )}
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
                  <th className="px-4 py-3">Destinasi</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">Memuat data...</td>
                  </tr>
                ) : recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">Belum ada pemesanan.</td>
                  </tr>
                ) : (
                  recentBookings.map((row) => {
                    const statusLabel = STATUS_LABEL[row.status] ?? row.status;
                    const isConfirmed = row.status === "confirmed";
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{row.bookingCode}</td>
                        <td className="px-4 py-3 font-medium">{row.customerName}</td>
                        <td className="px-4 py-3 text-slate-500">{row.tripName}</td>
                        <td className="px-4 py-3 font-bold text-[#F49D1A]">
                          Rp {Number(row.totalAmount).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isConfirmed
                              ? "bg-[#1CA6B7]/15 text-[#1CA6B7]"
                              : row.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : row.status === "completed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {statusLabel}
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
              href="/admin/destinations"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-[#F49D1A]/10 hover:border-[#F49D1A]/20 border border-slate-100 transition group"
            >
              <span className="font-semibold text-slate-800 group-hover:text-[#F49D1A]">Tambah Destinasi Baru</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#F49D1A]" />
            </Link>
            <Link
              href="/admin/promotions"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-[#F49D1A]/10 hover:border-[#F49D1A]/20 border border-slate-100 transition group"
            >
              <span className="font-semibold text-slate-800 group-hover:text-[#F49D1A]">Buat Kode Kupon / Promo</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#F49D1A]" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
