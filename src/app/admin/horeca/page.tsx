"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import Modal from "../components/modal";
import ConfirmDelete from "../components/confirm-delete";

interface HorecaItem {
  id: string;
  typeId: string | null;
  name: string;
  starCategory: string | null;
  address: string | null;
  phone: string | null;
  isAccessibleForElderly: boolean;
  isActive: boolean;
  createdAt: string;
}

interface HorecaForm {
  typeId: string;
  name: string;
  starCategory: string;
  address: string;
  phone: string;
  isAccessibleForElderly: boolean;
  isActive: boolean;
}

const emptyForm: HorecaForm = { typeId: "", name: "", starCategory: "", address: "", phone: "", isAccessibleForElderly: false, isActive: true };

export default function AdminHoreca() {
  const [rows, setRows] = useState<HorecaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HorecaItem | null>(null);
  const [form, setForm] = useState<HorecaForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [types, setTypes] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetch("/api/horeca-types").then(r => r.json()).then(setTypes).catch(() => {}); }, []);

  async function fetchData() {
    setLoading(true);
    const res = await fetch("/api/horeca");
    const data = await res.json();
    setRows(data);
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item: HorecaItem) {
    setEditing(item);
    setForm({
      typeId: item.typeId || "",
      name: item.name,
      starCategory: item.starCategory || "",
      address: item.address || "",
      phone: item.phone || "",
      isAccessibleForElderly: item.isAccessibleForElderly,
      isActive: item.isActive,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editing ? `/api/horeca/${editing.id}` : "/api/horeca";
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
    await fetch(`/api/horeca/${deleting}`, { method: "DELETE" });
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manajemen HORECA</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola hotel, restoran, café, dan akomodasi ramah lansia.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-2xl bg-[#F49D1A] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#F49D1A]/20 hover:bg-[#c47d12] transition inline-flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah HORECA</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">Bintang</th>
                <th className="px-6 py-4">Akses Lansia</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Memuat data...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Belum ada data HORECA.</td></tr>
              ) : (
                rows.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{h.name}</td>
                    <td className="px-6 py-4 text-slate-500">{h.starCategory || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${h.isAccessibleForElderly ? "bg-[#1CA6B7]/15 text-[#1CA6B7]" : "bg-slate-100 text-slate-600"}`}>
                        {h.isAccessibleForElderly ? "Aksesibel" : "Tidak"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${h.isActive ? "bg-[#1CA6B7]/15 text-[#1CA6B7]" : "bg-slate-100 text-slate-600"}`}>
                        {h.isActive ? "Aktif" : "Non-Aktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => openEdit(h)} className="p-2 text-slate-500 hover:text-[#F49D1A] hover:bg-[#F49D1A]/10 rounded-xl transition" title="Edit HORECA">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setDeleting(h.id); setDeleteOpen(true); }} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition" title="Hapus">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit HORECA" : "Tambah HORECA"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Tipe HORECA</label>
            <select name="typeId" value={form.typeId} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" required>
              <option value="">-- Pilih Tipe --</option>
              {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Nama</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Kategori Bintang</label>
              <select name="starCategory" value={form.starCategory} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]">
                <option value="">-- Pilih --</option>
                <option value="1">★</option>
                <option value="2">★★</option>
                <option value="3">★★★</option>
                <option value="4">★★★★</option>
                <option value="5">★★★★★</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Telepon</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Alamat</label>
            <textarea name="address" value={form.address} onChange={handleChange} rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 text-sm">
              <input name="isAccessibleForElderly" type="checkbox" checked={form.isAccessibleForElderly} onChange={handleChange}
                className="w-4 h-4 rounded border-slate-300 text-[#F49D1A] focus:ring-[#F49D1A]/30" />
              <span className="font-medium text-slate-700">Aksesibel untuk Lansia</span>
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange}
                className="w-4 h-4 rounded border-slate-300 text-[#F49D1A] focus:ring-[#F49D1A]/30" />
              <span className="font-medium text-slate-700">Aktif</span>
            </label>
          </div>
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
