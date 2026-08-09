"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import ConfirmDelete from "../components/confirm-delete";

interface Trip {
  id: string;
  title: string;
  type: string;
  durationDays: number;
  maxParticipants: number | null;
  status: string;
}

export default function AdminTrips() {
  const [rows, setRows] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/trips");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleting) return;
    await fetch(`/api/trips/${deleting}`, { method: "DELETE" });
    setDeleteOpen(false);
    setDeleting(null);
    fetchData();
  }

  const statusStyles: Record<string, string> = {
    published: "bg-[#1CA6B7]/15 text-[#1CA6B7]",
    draft: "bg-slate-100 text-slate-700",
    cancelled: "bg-amber-100 text-amber-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manajemen Paket Trip</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola daftar paket trip, jadwal keberangkatan, dan kuota peserta.</p>
        </div>
        <Link
          href="/admin/trips/new"
          className="rounded-2xl bg-[#F49D1A] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#F49D1A]/20 hover:bg-[#c47d12] transition inline-flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Trip Baru</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-4">Judul Paket</th>
                <th className="px-6 py-4">Tipe Trip</th>
                <th className="px-6 py-4">Durasi</th>
                <th className="px-6 py-4">Maks Peserta</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Memuat data...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Belum ada data trip.</td></tr>
              ) : (
                rows.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{t.title}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium capitalize">{t.type?.replace("_", " ")}</td>
                    <td className="px-6 py-4 text-slate-500">{t.durationDays} hari</td>
                    <td className="px-6 py-4 text-slate-500">{t.maxParticipants ?? "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${statusStyles[t.status] || "bg-slate-100 text-slate-600"}`}>{t.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/admin/trips/${t.id}/edit`}
                          className="p-2 text-slate-500 hover:text-[#F49D1A] hover:bg-[#F49D1A]/10 rounded-xl transition"
                          title="Edit Trip"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => { setDeleting(t.id); setDeleteOpen(true); }} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      <ConfirmDelete open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} />
    </div>
  );
}
