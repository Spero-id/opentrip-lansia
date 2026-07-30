"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Eye, Filter, ChevronDown } from "lucide-react";

interface PrivateRequest {
  id: string;
  title: string;
  userId: string;
  durationDays: number;
  participantsCount: number;
  status: string;
  submittedAt: string | null;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  submitted: "bg-amber-100 text-amber-800",
  reviewed: "bg-blue-100 text-blue-700",
  revision: "bg-purple-100 text-purple-700",
  approved: "bg-[#1CA6B7]/15 text-[#1CA6B7]",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminPrivateTripsList() {
  const [rows, setRows] = useState<PrivateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);
    const res = await fetch(`/api/private-trip/admin?${params.toString()}`);
    const data = await res.json();
    setRows(data.rows || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Private Trip Request</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola permintaan Private Trip dari pengguna.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Filter className="w-4 h-4" />
          <span>Filter:</span>
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2 pr-8 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
          >
            <option value="">Semua Status</option>
            <option value="submitted">Submitted</option>
            <option value="reviewed">Reviewed</option>
            <option value="revision">Revision</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari judul..."
          className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A] w-full sm:w-48"
        />
        <span className="text-xs text-slate-400 ml-auto">{total} request</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-4">Judul Perjalanan</th>
                <th className="px-6 py-4">Peserta</th>
                <th className="px-6 py-4">Durasi</th>
                <th className="px-6 py-4">Tgl Submit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Memuat data...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Belum ada request Private Trip.</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900 max-w-xs truncate">{r.title}</td>
                    <td className="px-6 py-4 text-slate-500">{r.participantsCount} org</td>
                    <td className="px-6 py-4 text-slate-500">{r.durationDays} hari</td>
                    <td className="px-6 py-4 text-slate-500">{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString("id-ID") : "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${statusStyles[r.status] || "bg-slate-100 text-slate-600"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/private-trips/${r.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#F49D1A]/10 text-[#F49D1A] hover:bg-[#F49D1A] hover:text-white px-3.5 py-2 text-[11px] font-bold transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Detail</span>
                      </Link>
                    </td>
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
