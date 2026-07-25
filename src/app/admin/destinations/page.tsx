"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Plus, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { slugify } from "@/shared/utils/helpers";
import Modal from "../components/modal";
import ConfirmDelete from "../components/confirm-delete";

const MapPicker = dynamic(() => import("@/app/admin/components/map-picker"), { ssr: false });

function parseGeoPoint(geoPoint: string | null): { lat: number | null; lng: number | null } {
  if (!geoPoint) return { lat: null, lng: null };
  const parts = geoPoint.split(",").map((s) => s.trim());
  if (parts.length !== 2) return { lat: null, lng: null };
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (isNaN(lat) || isNaN(lng)) return { lat: null, lng: null };
  return { lat, lng };
}

interface Category {
  id: string;
  name: string;
}

interface Destination {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  location: string | null;
  geoPoint: string | null;
  categoryId: string | null;
  difficultyLevel: string | null;
  isActive: boolean | null;
  visitEstimateMinutes: number | null;
  accessibilityInfo: string | null;
}

interface DestinationForm {
  name: string;
  slug: string;
  description: string;
  location: string;
  geoPoint: string;
  categoryId: string;
  difficultyLevel: string;
  isActive: boolean;
  visitEstimateMinutes: number | null;
  accessibilityInfo: string;
}

const emptyForm: DestinationForm = {
  name: "", slug: "", description: "", location: "", geoPoint: "", categoryId: "",
  difficultyLevel: "", isActive: true, visitEstimateMinutes: null, accessibilityInfo: "",
};

export default function AdminDestinations() {
  const [rows, setRows] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [form, setForm] = useState<DestinationForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    fetch("/api/destinations/categories").then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  async function fetchData() {
    setLoading(true);
    const res = await fetch("/api/destinations");
    const data = await res.json();
    setRows(data);
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setLatitude(null);
    setLongitude(null);
    setModalOpen(true);
  }

  function openEdit(item: Destination) {
    setEditing(item);
    const parsed = parseGeoPoint(item.geoPoint);
    setLatitude(parsed.lat);
    setLongitude(parsed.lng);
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      location: item.location || "",
      geoPoint: item.geoPoint || "",
      categoryId: item.categoryId || "",
      difficultyLevel: item.difficultyLevel || "",
      isActive: item.isActive ?? true,
      visitEstimateMinutes: item.visitEstimateMinutes,
      accessibilityInfo: item.accessibilityInfo || "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editing ? `/api/destinations/${editing.id}` : "/api/destinations";
    await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        visitEstimateMinutes: form.visitEstimateMinutes || null,
        categoryId: form.categoryId || null,
        slug: form.slug || slugify(form.name) + "-" + Date.now(),
      }),
    });
    setSaving(false);
    setModalOpen(false);
    fetchData();
  }

  async function handleDelete() {
    if (!deleting) return;
    await fetch(`/api/destinations/${deleting}`, { method: "DELETE" });
    setDeleteOpen(false);
    setDeleting(null);
    fetchData();
  }

  function handleMapChange(lat: number, lng: number) {
    setLatitude(lat);
    setLongitude(lng);
    setForm((prev) => ({ ...prev, geoPoint: `${lat},${lng}` }));
  }

  function handleLatLngChange(type: "lat" | "lng", value: string) {
    const num = value ? parseFloat(value) : null;
    const valid = num !== null && !isNaN(num);
    if (type === "lat") setLatitude(valid ? num : null);
    else setLongitude(valid ? num : null);

    const newLat = type === "lat" ? (valid ? num : latitude) : latitude;
    const newLng = type === "lng" ? (valid ? num : longitude) : longitude;
    if (newLat !== null && newLng !== null) {
      setForm((prev) => ({ ...prev, geoPoint: `${newLat},${newLng}` }));
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "name" && !editing ? { slug: slugify(value) } : {}),
    }));
  }

  const catMap = categories.reduce<Record<string, string>>((acc, c) => { acc[c.id] = c.name; return acc; }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manajemen Destinasi</h1>
          <p className="text-sm text-slate-500 mt-1">Daftar lokasi wisata & fisik lansia yang tersedia di OpenTrip.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-2xl bg-[#e06d26] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-orange-500/20 hover:bg-[#c85b18] transition inline-flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Destinasi</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-4">Nama Destinasi</th>
                <th className="px-6 py-4">Lokasi</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Tingkat Kesulitan</th>
                <th className="px-6 py-4">Status Aktif</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Memuat data...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Belum ada data destinasi.</td></tr>
              ) : (
                rows.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{d.name}</td>
                    <td className="px-6 py-4 text-slate-500">{d.location || "-"}</td>
                    <td className="px-6 py-4 text-slate-500">{d.categoryId ? catMap[d.categoryId] || "-" : "-"}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{d.difficultyLevel || "-"}</td>
                    <td className="px-6 py-4">
                      {d.isActive ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          <XCircle className="w-3 h-3" /> Non-Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => openEdit(d)} className="p-2 text-slate-500 hover:text-[#e06d26] hover:bg-orange-50 rounded-xl transition" title="Edit Destinasi">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setDeleting(d.id); setDeleteOpen(true); }} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition" title="Hapus">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Destinasi" : "Tambah Destinasi"} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Nama Destinasi</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Slug</label>
            <input name="slug" value={form.slug} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Deskripsi</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Lokasi</label>
              <input name="location" value={form.location} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Kategori</label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]">
                <option value="">-- Pilih Kategori --</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Latitude</label>
              <input type="number" step="any"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]"
                value={latitude ?? ""} onChange={(e) => handleLatLngChange("lat", e.target.value)}
                placeholder="-8.12345" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Longitude</label>
              <input type="number" step="any"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]"
                value={longitude ?? ""} onChange={(e) => handleLatLngChange("lng", e.target.value)}
                placeholder="114.12345" />
            </div>
          </div>
          <MapPicker latitude={latitude} longitude={longitude} onChange={handleMapChange} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Tingkat Kesulitan</label>
              <select name="difficultyLevel" value={form.difficultyLevel} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]">
                <option value="">-- Pilih --</option>
                <option value="Mudah">Mudah</option>
                <option value="Sedang">Sedang</option>
                <option value="Sulit">Sulit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Estimasi (menit)</label>
              <input name="visitEstimateMinutes" type="number" value={form.visitEstimateMinutes ?? ""}
                onChange={e => setForm(prev => ({ ...prev, visitEstimateMinutes: e.target.value ? Number(e.target.value) : null }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]" min={0} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Informasi Aksesibilitas</label>
            <textarea name="accessibilityInfo" value={form.accessibilityInfo} onChange={handleChange} rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]" />
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange}
              className="w-4 h-4 rounded border-slate-300 text-[#e06d26] focus:ring-[#e06d26]/30" />
            <span className="font-medium text-slate-700">Aktif</span>
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
