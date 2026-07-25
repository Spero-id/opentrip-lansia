"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import Modal from "../components/modal";
import ConfirmDelete from "../components/confirm-delete";

interface Gallery {
  id: string;
  tripId: string;
  title: string | null;
  description: string | null;
  isPrivate: boolean;
  createdAt: string;
}

interface GalleryForm {
  tripId: string;
  title: string;
  description: string;
  isPrivate: boolean;
}

const emptyForm: GalleryForm = { tripId: "", title: "", description: "", isPrivate: false };

export default function AdminGalleries() {
  const [rows, setRows] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Gallery | null>(null);
  const [form, setForm] = useState<GalleryForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const res = await fetch("/api/galleries");
    const data = await res.json();
    setRows(data);
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item: Gallery) {
    setEditing(item);
    setForm({
      tripId: item.tripId,
      title: item.title || "",
      description: item.description || "",
      isPrivate: item.isPrivate,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editing ? `/api/galleries/${editing.id}` : "/api/galleries";
    await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setModalOpen(false);
    fetchData();
  }

  async function handleDelete() {
    if (!deleting) return;
    await fetch(`/api/galleries/${deleting}`, { method: "DELETE" });
    setDeleteOpen(false);
    setDeleting(null);
    fetchData();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manajemen Galeri</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola galeri foto dan video per paket trip.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-2xl bg-[#e06d26] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-orange-500/20 hover:bg-[#c85b18] transition inline-flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Galeri</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-4">Judul</th>
                <th className="px-6 py-4">Trip ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Memuat data...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Belum ada data galeri.</td></tr>
              ) : (
                rows.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{g.title || "(tanpa judul)"}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{g.tripId.slice(0, 8)}...</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${g.isPrivate ? "bg-yellow-100 text-yellow-700" : "bg-emerald-100 text-emerald-800"}`}>
                        {g.isPrivate ? "Private" : "Public"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{g.createdAt ? new Date(g.createdAt).toLocaleDateString("id-ID") : "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => openEdit(g)} className="p-2 text-slate-500 hover:text-[#e06d26] hover:bg-orange-50 rounded-xl transition" title="Edit Galeri">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setDeleting(g.id); setDeleteOpen(true); }} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition" title="Hapus">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Galeri" : "Tambah Galeri"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Trip ID</label>
            <input name="tripId" value={form.tripId} onChange={handleChange} required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Judul</label>
            <input name="title" value={form.title} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Deskripsi</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]" />
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input name="isPrivate" type="checkbox" checked={form.isPrivate} onChange={handleChange}
              className="w-4 h-4 rounded border-slate-300 text-[#e06d26] focus:ring-[#e06d26]/30" />
            <span className="font-medium text-slate-700">Galeri Private</span>
          </label>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="rounded-xl bg-[#e06d26] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:bg-[#c85b18] transition disabled:opacity-50">
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
