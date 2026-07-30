"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, Star } from "lucide-react";
import Modal from "../components/modal";
import ConfirmDelete from "../components/confirm-delete";

interface Review {
  id: string;
  rating: number;
  content: string | null;
  status: string;
  isFeatured: boolean;
  bookingId: string;
  tripId: string;
  createdAt: string;
}

interface ReviewForm {
  status: string;
  isFeatured: boolean;
}

const emptyForm: ReviewForm = { status: "pending", isFeatured: false };

export default function AdminReviews() {
  const [rows, setRows] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [form, setForm] = useState<ReviewForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const res = await fetch("/api/reviews");
    const data = await res.json();
    setRows(data);
    setLoading(false);
  }

  function openEdit(item: Review) {
    setEditing(item);
    setForm({ status: item.status, isFeatured: item.isFeatured });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    await fetch(`/api/reviews/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setModalOpen(false);
    fetchData();
  }

  async function handleDelete() {
    if (!deleting) return;
    await fetch(`/api/reviews/${deleting}`, { method: "DELETE" });
    setDeleteOpen(false);
    setDeleting(null);
    fetchData();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  const statusStyles: Record<string, string> = {
    approved: "bg-[#1CA6B7]/15 text-[#1CA6B7]",
    rejected: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manajemen Ulasan</h1>
          <p className="text-sm text-slate-500 mt-1">Moderasi ulasan dan rating dari pengguna.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Konten</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Memuat data...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Belum ada data ulasan.</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
                        {r.rating}/5 <Star className="w-3 h-3 fill-amber-500" />
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-500">{r.content || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyles[r.status] || "bg-slate-100 text-slate-600"}`}>{r.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${r.isFeatured ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                        {r.isFeatured ? "Featured" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => openEdit(r)} className="p-2 text-slate-500 hover:text-[#F49D1A] hover:bg-[#F49D1A]/10 rounded-xl transition" title="Edit Ulasan">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setDeleting(r.id); setDeleteOpen(true); }} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition" title="Hapus">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Edit Ulasan" size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <select name="status" value={form.status} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]">
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input name="isFeatured" type="checkbox" checked={form.isFeatured} onChange={handleChange}
              className="w-4 h-4 rounded border-slate-300 text-[#F49D1A] focus:ring-[#F49D1A]/30" />
            <span className="font-medium text-slate-700">Featured Review</span>
          </label>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="rounded-xl bg-[#F49D1A] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#F49D1A]/20 hover:bg-[#c47d12] transition disabled:opacity-50">
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
            <button type="button" onClick={() => setModalOpen(false)}
              className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
              Batal
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDelete open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} />
    </div>
  );
}
