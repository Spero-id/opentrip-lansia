import Link from "next/link";
import { Compass, MapPin, Calendar, DollarSign, TrendingUp, Users, ArrowUpRight } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Paket Trip", value: "24", change: "+12% bln ini", icon: MapPin, color: "text-[#e06d26]", bg: "bg-orange-50" },
    { label: "Pemesanan Bulan Ini", value: "148", change: "+24% vs lalu", icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Pendapatan", value: "Rp 128.5M", change: "+18.4%", icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Promo Aktif", value: "6", change: "2 Berakhir", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
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
          className="rounded-2xl bg-[#e06d26] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-orange-500/20 hover:bg-[#c85b18] transition inline-flex items-center gap-2 shrink-0"
        >
          <span>+ Buat Trip Baru</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
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
                <span className="text-2xl font-extrabold text-slate-900">{stat.value}</span>
                <span className="block text-[11px] font-semibold text-emerald-600 mt-1">{stat.change}</span>
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
            <Link href="/admin/trips" className="text-xs font-semibold text-[#e06d26] hover:underline flex items-center gap-1">
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
                {[
                  { code: "OTP-8821", name: "Budi Santoso", trip: "Labuan Bajo Phinisi", total: "Rp 1.800.000", status: "Terkonfirmasi" },
                  { code: "OTP-8822", name: "Siti Rahmawati", trip: "Kawah Ijen Blue Fire", total: "Rp 500.000", status: "Pending" },
                  { code: "OTP-8823", name: "Aditya Pratama", trip: "Nusa Penida Island", total: "Rp 750.000", status: "Terkonfirmasi" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{row.code}</td>
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-slate-500">{row.trip}</td>
                    <td className="px-4 py-3 font-bold text-[#e06d26]">{row.total}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        row.status === "Terkonfirmasi" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
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
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-orange-50 hover:border-orange-200 border border-slate-100 transition group"
            >
              <span className="font-semibold text-slate-800 group-hover:text-[#e06d26]">Kelola Paket Trip</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#e06d26]" />
            </Link>
            <Link
              href="/admin/destinations"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-orange-50 hover:border-orange-200 border border-slate-100 transition group"
            >
              <span className="font-semibold text-slate-800 group-hover:text-[#e06d26]">Tambah Destinasi Baru</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#e06d26]" />
            </Link>
            <Link
              href="/admin/promotions"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-orange-50 hover:border-orange-200 border border-slate-100 transition group"
            >
              <span className="font-semibold text-slate-800 group-hover:text-[#e06d26]">Buat Kode Kupon / Promo</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#e06d26]" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
