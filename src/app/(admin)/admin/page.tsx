"use client";

import Link from "next/link";
import { Compass, Calendar, DollarSign, TrendingUp, ArrowUpRight } from "lucide-react";
import { useAdminDashboard } from "@/features/admin";
import { formatIDRCompact } from "@/utils/format";

function formatStatus(status: string): { label: string; className: string } {
  switch (status) {
    case "confirmed":
      return { label: "Terkonfirmasi", className: "bg-secondary/15 text-secondary-foreground" };
    case "completed":
      return { label: "Selesai", className: "bg-success-100 text-success-700" };
    case "cancelled":
      return { label: "Dibatalkan", className: "bg-destructive-100 text-destructive-700" };
    case "pending":
    default:
      return { label: "Pending", className: "bg-warning-100 text-warning-800" };
  }
}

function StatCardSkeleton() {
  return (
    <div className="bg-card p-5 rounded-3xl border border-border/80 shadow-xs flex flex-col justify-between space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-32 bg-border rounded" />
        <div className="w-10 h-10 rounded-2xl bg-border" />
      </div>
      <div>
        <div className="h-7 w-24 bg-border rounded mb-2" />
        <div className="h-3 w-20 bg-muted rounded" />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { stats, recentBookings, loading, error } = useAdminDashboard();

  const statCards = stats
    ? [
        {
          label: "Total Destinasi & Trip",
          value: String(stats.totalTrips),
          change: "Total aktif",
          icon: Compass,
          color: "text-primary-foreground",
          bg: "bg-primary/10",
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
          color: "text-secondary-foreground",
          bg: "bg-secondary/10",
        },
        {
          label: "Total Pendapatan",
          value: stats.revenue,
          change: "Booking confirmed & selesai",
          icon: DollarSign,
          color: "text-info-600",
          bg: "bg-info-50",
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-6 rounded-3xl border border-border/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Selamat datang di panel admin Jelajah Memoria. Pantau performa bisnis dan pengelolaan destinasi secara real-time.
          </p>
        </div>
        <Link
          href="/admin/trips"
          className="rounded-2xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition inline-flex items-center gap-2 shrink-0"
        >
          <span>+ Buat Trip Baru</span>
        </Link>
      </div>

      {error && (
        <div className="bg-destructive-50 border border-destructive-200 text-destructive-700 text-sm px-4 py-3 rounded-2xl">
          Gagal memuat data dashboard: {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading || !statCards
          ? Array.from({ length: 4 }).map((_, idx) => <StatCardSkeleton key={idx} />)
          : statCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="bg-card p-5 rounded-3xl border border-border/80 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">{stat.label}</span>
                    <div className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <span className="text-2xl font-extrabold text-foreground">{stat.value}</span>
                    <span className="block text-[11px] font-semibold text-secondary-foreground mt-1">{stat.change}</span>
                  </div>
                </div>
              );
            })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-8 bg-card p-4 sm:p-6 rounded-3xl border border-border/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Pemesanan Terbaru</h2>
            <Link href="/admin/notifications" className="text-xs font-semibold text-primary-foreground hover:underline flex items-center gap-1">
              <span>Lihat Semua Notifikasi</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted text-muted-foreground font-semibold border-b border-border">
                <tr>
                  <th className="px-4 py-3">Kode Booking</th>
                  <th className="px-4 py-3">Pemesan</th>
                  <th className="px-4 py-3">Paket Trip</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-3 bg-border rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Belum ada pemesanan.
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((row) => {
                    const { label, className } = formatStatus(row.status);
                    return (
                      <tr key={row.id} className="hover:bg-muted/60 transition">
                        <td className="px-4 py-3 font-mono font-bold text-foreground">{row.bookingCode}</td>
                        <td className="px-4 py-3 font-medium">{row.customerName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.tripName}</td>
                        <td className="px-4 py-3 font-bold text-primary-foreground">{formatIDRCompact(row.totalAmount)}</td>
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

        <div className="lg:col-span-4 bg-card p-4 sm:p-6 rounded-3xl border border-border/80 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-foreground">Aksi Cepat</h2>

          <div className="space-y-3 text-xs">
            <Link
              href="/admin/trips"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-muted hover:bg-primary/10 hover:border-primary/20 border border-border transition group"
            >
              <span className="font-semibold text-foreground group-hover:text-primary-foreground">Kelola Paket Trip</span>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground" />
            </Link>
            <Link
              href="/admin/trips"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-muted hover:bg-primary/10 hover:border-primary/20 border border-border transition group"
            >
              <span className="font-semibold text-foreground group-hover:text-primary-foreground">Tambah Trip Baru</span>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground" />
            </Link>
            <Link
              href="/admin/promotions"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-muted hover:bg-primary/10 hover:border-primary/20 border border-border transition group"
            >
              <span className="font-semibold text-foreground group-hover:text-primary-foreground">Buat Kode Kupon / Promo</span>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground" />
            </Link>
            <Link
              href="/admin/bookings"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-muted hover:bg-primary/10 hover:border-primary/20 border border-border transition group"
            >
              <span className="font-semibold text-foreground group-hover:text-primary-foreground">Lihat Semua Pemesanan</span>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
