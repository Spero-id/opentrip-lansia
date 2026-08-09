"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import CreatableSelect from "react-select/creatable";
import { slugify } from "@/shared/utils/helpers";
import Modal from "../components/modal";
import ConfirmDelete from "../components/confirm-delete";
import ImageManager from "./image-manager";

const PROVINCES = [
  "Aceh",
  "Sumatera Utara",
  "Sumatera Barat",
  "Riau",
  "Kepulauan Riau",
  "Jambi",
  "Sumatera Selatan",
  "Bangka Belitung",
  "Bengkulu",
  "Lampung",
  "DKI Jakarta",
  "Jawa Barat",
  "Banten",
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Bali",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Kalimantan Barat",
  "Kalimantan Tengah",
  "Kalimantan Selatan",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Sulawesi Utara",
  "Gorontalo",
  "Sulawesi Tengah",
  "Sulawesi Barat",
  "Sulawesi Selatan",
  "Sulawesi Tenggara",
  "Maluku",
  "Maluku Utara",
  "Papua",
  "Papua Barat",
  "Papua Selatan",
  "Papua Tengah",
  "Papua Pegunungan",
  "Papua Barat Daya",
];

function formatRupiah(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === "" || val === 0) return "";
  const raw = String(val).replace(/\D/g, "");
  if (!raw) return "";
  const num = parseInt(raw, 10);
  return "Rp " + num.toLocaleString("id-ID");
}

function parseRupiah(val: string): number {
  const raw = val.replace(/\D/g, "");
  return raw ? parseInt(raw, 10) : 0;
}

interface Trip {
  id: string;
  type: string;
  title: string;
  slug: string;
  description: string | null;
  durationDays: number;
  status: string;
  isFeatured: boolean;
  categoryId: string | null;
  location: string | null;
  province?: string | null;
  isSeniorFriendly: boolean | null;
  accessibilityInfo: string | null;
  priceMin: number | null;
  priceMax: number | null;
  itinerary?: { day: number; location?: string; title: string; description: string }[];
  itineraryItems?: { dayNumber: number; location?: string; title: string; description: string }[];
  createdAt: string;
}

interface ItineraryItemInput {
  dayNumber: number;
  location: string;
  title: string;
  description: string;
}

interface TripForm {
  type: string;
  title: string;
  slug: string;
  description: string;
  durationDays: number;
  status: string;
  isFeatured: boolean;
  categoryId: string;
  location: string;
  province: string;
  geoPoint: string;
  isSeniorFriendly: boolean;
  accessibilityInfo: string;
  image: string;
  price: number;
}

const emptyForm: TripForm = {
  type: "open_trip",
  title: "",
  slug: "",
  description: "",
  durationDays: 1,
  status: "draft",
  isFeatured: false,
  categoryId: "",
  location: "",
  province: "",
  geoPoint: "",
  isSeniorFriendly: true,
  accessibilityInfo: "",
  image: "",
  price: 0,
};

export default function AdminTrips() {
  const [rows, setRows] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Trip | null>(null);
  const [form, setForm] = useState<TripForm>(emptyForm);
  const [images, setImages] = useState<string[]>([]);
  const [itineraryList, setItineraryList] = useState<ItineraryItemInput[]>([]);
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => {
      const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : type === "number" ? Number(value) : value;
      const updated = {
        ...prev,
        [name]: val,
      };
      if (name === "title") {
        updated.slug = slugify(value);
      }
      return updated;
    });
  }

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseRupiah(e.target.value);
    setForm((prev) => ({ ...prev, price: val }));
  }

  function addItineraryItem() {
    const nextDay = itineraryList.length > 0 ? itineraryList[itineraryList.length - 1].dayNumber + 1 : 1;
    setItineraryList((prev) => [
      ...prev,
      { dayNumber: nextDay, location: "", title: "", description: "" },
    ]);
  }

  function removeItineraryItem(index: number) {
    setItineraryList((prev) => prev.filter((_, i) => i !== index));
  }

  function handleItineraryChange(index: number, field: keyof ItineraryItemInput, value: string | number) {
    setItineraryList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  const tripRows = Array.isArray(rows) ? rows : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manajemen Paket Trip</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola paket open trip.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-2xl bg-[#F49D1A] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#F49D1A]/20 hover:bg-[#c47d12] transition inline-flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Trip</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-4">Judul</th>
                <th className="px-6 py-4">Tipe</th>
                <th className="px-6 py-4">Lokasi & Provinsi</th>
                <th className="px-6 py-4">Hari</th>
                <th className="px-6 py-4">Harga</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">Memuat data...</td></tr>
              ) : tripRows.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">Belum ada data trip.</td></tr>
              ) : (
                tripRows.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{t.title}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full px-2.5 py-1 text-[10px] font-bold bg-slate-100 text-slate-600">
                        Open Trip
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {[t.location, t.province].filter(Boolean).join(", ") || "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{t.durationDays}H</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {t.priceMin ? formatRupiah(t.priceMin) : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${t.status === "published" ? "bg-[#1CA6B7]/15 text-[#1CA6B7]" : t.status === "draft" ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-700"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {t.isFeatured ? (
                        <Eye className="w-4 h-4 text-[#1CA6B7]" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-300" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => openEdit(t)} className="p-2 text-slate-500 hover:text-[#F49D1A] hover:bg-[#F49D1A]/10 rounded-xl transition" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Trip" : "Tambah Trip"} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Judul Trip</label>
              <input name="title" value={form.title} onChange={handleChange} required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Slug</label>
              <input name="slug" value={form.slug} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Durasi (Hari)</label>
              <input name="durationDays" type="number" min={1} value={form.durationDays} onChange={handleChange} required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Deskripsi</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Informasi Destinasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Pilih Provinsi</label>
                <select
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
                >
                  <option value="">Pilih Provinsi</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Lokasi Utama</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Contoh: Kintamani, Ubud"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                <CreatableSelect
                  isClearable
                  placeholder="Pilih atau ketik kategori baru..."
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  value={
                    categories
                      .map((c) => ({ value: c.id, label: c.name }))
                      .find((c) => c.value === form.categoryId) || null
                  }
                  onChange={(newValue) => setForm((prev) => ({ ...prev, categoryId: newValue ? newValue.value : "" }))}
                  onCreateOption={handleCreateCategory}
                  formatCreateLabel={(inputValue) => `+ Buat kategori "${inputValue}"`}
                  className="text-sm"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: "0.5rem",
                      borderColor: "#cbd5e1",
                      minHeight: "38px",
                      boxShadow: "none",
                      "&:hover": { borderColor: "#F49D1A" },
                    }),
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Harga (Rp)</label>
                <input
                  type="text"
                  value={formatRupiah(form.price)}
                  onChange={handlePriceChange}
                  placeholder="Rp 0"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
                />
              </div>
              <div className="md:col-span-2">
                <ImageManager
                  cover={images.length > 0 ? images[0] : null}
                  images={images}
                  onChange={({ images: next }) => setImages(next)}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Itinerary / Rencana Perjalanan</h3>
                <p className="text-xs text-slate-500">Kelola jadwal kegiatan per hari.</p>
              </div>
              <button
                type="button"
                onClick={addItineraryItem}
                className="px-3 py-1.5 text-xs font-semibold text-[#F49D1A] bg-[#F49D1A]/10 hover:bg-[#F49D1A]/20 rounded-xl transition inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Hari / Kegiatan</span>
              </button>
            </div>

            {itineraryList.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                Belum ada item itinerary. Klik tombol di atas untuk menambah kegiatan.
              </p>
            ) : (
              <div className="space-y-3">
                {itineraryList.map((item, index) => (
                  <div key={index} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        Item #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItineraryItem(index)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Hapus Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-600">Hari ke-</label>
                        <input
                          type="number"
                          min={1}
                          value={item.dayNumber}
                          onChange={(e) => handleItineraryChange(index, "dayNumber", Number(e.target.value))}
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-semibold text-slate-600">Wilayah / Lokasi</label>
                        <input
                          type="text"
                          value={item.location}
                          onChange={(e) => handleItineraryChange(index, "location", e.target.value)}
                          placeholder="Contoh: Borobudur, Magelang"
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
                        />
                      </div>
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-semibold text-slate-600">Judul Kegiatan</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleItineraryChange(index, "title", e.target.value)}
                          placeholder="Contoh: Penjelajahan Candi & Foto Bersama"
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">Deskripsi Kegiatan</label>
                      <textarea
                        rows={2}
                        value={item.description}
                        onChange={(e) => handleItineraryChange(index, "description", e.target.value)}
                        placeholder="Detail jadwal atau petunjuk singkat kegiatan..."
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Aksesibilitas Lansia</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input name="isSeniorFriendly" type="checkbox" checked={form.isSeniorFriendly} onChange={handleChange}
                  className="rounded border-slate-300 text-[#F49D1A] focus:ring-[#F49D1A]/30" />
                <label className="text-sm font-medium text-slate-700">Ramah Lansia</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Info Aksesibilitas</label>
                <textarea name="accessibilityInfo" value={form.accessibilityInfo} onChange={handleChange} rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input name="isFeatured" type="checkbox" checked={form.isFeatured} onChange={handleChange}
              className="rounded border-slate-300 text-[#F49D1A] focus:ring-[#F49D1A]/30" />
            <label className="text-sm font-medium text-slate-700">Featured (Tampilkan di beranda)</label>
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
