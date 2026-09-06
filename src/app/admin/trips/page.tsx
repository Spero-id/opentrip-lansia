"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Sparkles, Check } from "lucide-react";
import CreatableSelect from "react-select/creatable";
import { slugify } from "@/shared/utils/helpers";
import Modal from "../components/modal";
import ConfirmDelete from "../components/confirm-delete";
import ImageManager from "./image-manager";
import IconPicker, { DynamicLucideIcon } from "../components/icon-picker";

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

function formatDate(val: string | null | undefined): string {
  if (!val) return "-";
  const [y, m, d] = val.slice(0, 10).split("-");
  if (!y || !m || !d) return val;
  return `${d}-${m}-${y}`;
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
  facilities?: (string | { name: string; icon?: string })[] | null;
  itinerary?: { day: number; location?: string; title: string; description: string }[];
  itineraryItems?: { dayNumber: number; location?: string; title: string; description: string }[];
  startDate?: string | null;
  departureId?: string | null;
  createdAt: string;
}

interface ItineraryItemInput {
  dayNumber: number;
  location: string;
  title: string;
  description: string;
}

interface FacilityItemInput {
  name: string;
  icon: string;
}

interface DepartureItemInput {
  startDate: string;
  maxParticipants: number;
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
  meetingPoint: string;
  meetingPointTime: string;
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
  meetingPoint: "",
  meetingPointTime: "08.00",
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
  const [facilitiesList, setFacilitiesList] = useState<FacilityItemInput[]>([]);
  const [departuresList, setDeparturesList] = useState<DepartureItemInput[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/trips?all=true");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setRows(data);
      } else {
        console.error("Failed to fetch trips:", data);
        setRows([]);
      }
    } catch (err) {
      console.error("Error fetching trips:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    const res = await fetch("/api/destinations/categories");
    if (res.ok) {
      const data = await res.json();
      setCategories(data);
      return data as { id: string; name: string }[];
    }
    return null;
  }

  async function handleCreateCategory(inputValue: string) {
    const res = await fetch("/api/destinations/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: inputValue }),
    });
    if (res.ok) {
      const newCategory = await res.json();
      setCategories((prev) => [...prev, newCategory]);
      setForm((prev) => ({ ...prev, categoryId: newCategory.id }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.categoryId;
        return next;
      });
    }
  }

  async function openCreate() {
    if (categories.length === 0) await fetchCategories();
    setEditing(null);
    setForm(emptyForm);
    setImages([]);
    setItineraryList([{ dayNumber: 1, location: "", title: "", description: "" }]);
    setFacilitiesList([{ name: "", icon: "Check" }]);
    setDeparturesList([{ startDate: "", maxParticipants: 10 }]);
    setErrors({});
    setModalOpen(true);
  }

  async function openEdit(item: Trip & { image?: string | null; images?: string[] | null }) {
    setEditing(item);
    setErrors({});
    setForm({
      type: "open_trip",
      title: item.title,
      slug: item.slug,
      description: item.description || "",
      durationDays: item.durationDays || 1,
      status: item.status || "draft",
      isFeatured: item.isFeatured || false,
      categoryId: item.categoryId || "",
      location: item.location || "",
      province: item.province || "",
      geoPoint: "",
      isSeniorFriendly: item.isSeniorFriendly ?? true,
      accessibilityInfo: item.accessibilityInfo || "",
      image: item.image || "",
      price: item.priceMin || item.priceMax || 0,
      meetingPoint: (() => {
        const mp = (item as unknown as Record<string, unknown>).meetingPointsJson;
        if (Array.isArray(mp) && mp.length > 0) return (mp[0] as { location?: string })?.location || "";
        return "";
      })(),
      meetingPointTime: (() => {
        const mp = (item as unknown as Record<string, unknown>).meetingPointsJson;
        if (Array.isArray(mp) && mp.length > 0) return (mp[0] as { time?: string })?.time || "08.00";
        return "08.00";
      })(),
    });
    setImages(item.images || []);

    const rawItinerary = item.itinerary || item.itineraryItems || [];
    setItineraryList(
      Array.isArray(rawItinerary) && rawItinerary.length > 0
        ? rawItinerary.map((it: { dayNumber?: number; day?: number; location?: string; title?: string; description?: string }) => ({
            dayNumber: it.dayNumber || it.day || 1,
            location: it.location || "",
            title: it.title || "",
            description: it.description || "",
          }))
        : []
    );

    const rawFacilities = item.facilities || [];
    setFacilitiesList(
      Array.isArray(rawFacilities) && rawFacilities.length > 0
        ? rawFacilities.map((f) =>
            typeof f === "string"
              ? { name: f, icon: "" }
              : { name: f?.name || "", icon: f?.icon || "" }
          )
        : []
    );

    try {
      const res = await fetch(`/api/trips/${item.id}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data?.departures)) {
        setDeparturesList(
          data.departures.map((d: { startDate?: string; maxParticipants?: number | null }) => ({
            startDate: d.startDate || "",
            maxParticipants: d.maxParticipants || 10,
          }))
        );
      } else {
        setDeparturesList([{ startDate: "", maxParticipants: 10 }]);
      }
    } catch {
      setDeparturesList([{ startDate: "", maxParticipants: 10 }]);
    }

    if (categories.length === 0) await fetchCategories();

    setModalOpen(true);
  }

  function validateForm(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Judul trip wajib diisi.";
    if (!form.slug.trim()) e.slug = "Slug wajib diisi.";
    if (!form.durationDays || form.durationDays < 1) e.durationDays = "Durasi minimal 1 hari.";
    if (!form.categoryId) e.categoryId = "Pilih atau buat kategori terlebih dahulu.";
    if (!form.location.trim()) e.location = "Lokasi utama wajib diisi.";
    if (!form.province) e.province = "Pilih provinsi.";
    if (!form.price || form.price <= 0) e.price = "Harga wajib diisi dan harus lebih dari 0.";
    if (!form.meetingPoint.trim()) e.meetingPoint = "Lokasi kumpul wajib diisi.";
    if (!form.meetingPointTime) e.meetingPointTime = "Jam kumpul wajib diisi.";
    if (departuresList.filter((d) => d.startDate.trim() !== "").length === 0) {
      e.departures = "Minimal satu jadwal keberangkatan wajib diisi.";
    }
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSaving(true);

    const payload: Record<string, unknown> = {
      type: "open_trip",
      title: form.title,
      slug: form.slug || undefined,
      description: form.description || undefined,
      durationDays: Number(form.durationDays) || 1,
      status: form.status,
      isFeatured: form.isFeatured,
      categoryId: form.categoryId || undefined,
      location: form.location || undefined,
      province: form.province || undefined,
      geoPoint: form.geoPoint || undefined,
      isSeniorFriendly: form.isSeniorFriendly,
      accessibilityInfo: form.accessibilityInfo || undefined,
      image: images.length > 0 ? images[0] : undefined,
      images: images.length > 0 ? images : undefined,
      priceMin: form.price || undefined,
      priceMax: form.price || undefined,
      price: form.price || undefined,
      departures: departuresList
        .filter((d) => d.startDate.trim() !== "")
        .map((d) => ({
          startDate: d.startDate,
          maxParticipants: Number(d.maxParticipants) || 10,
        })),
      facilities: facilitiesList
        .filter((item) => item.name.trim() !== "")
        .map((item) => ({
          name: item.name.trim(),
          icon: item.icon || "",
        })),
      itinerary: itineraryList.map((item) => ({
        day: Number(item.dayNumber) || 1,
        location: item.location,
        title: item.title,
        description: item.description,
      })),
      itineraryItems: itineraryList.map((item) => ({
        dayNumber: Number(item.dayNumber) || 1,
        location: item.location,
        title: item.title || `Hari ${item.dayNumber || 1}`,
        description: item.description,
      })),
      meetingPointsJson: form.meetingPoint.trim()
        ? [{ time: form.meetingPointTime || "08.00", location: form.meetingPoint.trim(), description: "Titik kumpul utama penjemputan. Silakan hadir 15 menit sebelum waktu tersebut." }]
        : [],
    };

    try {
      const url = editing ? `/api/trips/${editing.id}` : "/api/trips";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(`Gagal menyimpan trip: ${errorData.error || res.statusText}`);
        return;
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error saving trip:", err);
      alert("Terjadi kesalahan saat menyimpan trip.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/trips/${deleting}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(`Gagal menghapus trip: ${errorData.error || res.statusText}`);
        return;
      }
      setDeleteOpen(false);
      setDeleting(null);
      fetchData();
    } catch (err) {
      console.error("Error deleting trip:", err);
      alert("Terjadi kesalahan saat menghapus trip.");
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
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
    setErrors((prev) => {
      const next = { ...prev };
      delete next.price;
      return next;
    });
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

  function addFacilityItem() {
    setFacilitiesList((prev) => [...prev, { name: "", icon: "" }]);
  }

  function addDepartureItem() {
    setDeparturesList((prev) => [...prev, { startDate: "", maxParticipants: 10 }]);
  }

  function removeDepartureItem(index: number) {
    setDeparturesList((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDepartureChange(index: number, field: keyof DepartureItemInput, value: string | number) {
    setDeparturesList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: field === "maxParticipants" ? Number(value) : value };
      return copy;
    });
    if (field === "startDate") {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.departures;
        return next;
      });
    }
  }

  function removeFacilityItem(index: number) {
    setFacilitiesList((prev) => prev.filter((_, i) => i !== index));
  }

  function handleFacilityChange(index: number, field: keyof FacilityItemInput, value: string) {
    setFacilitiesList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  const tripRows = Array.isArray(rows) ? rows : [];

  const fieldClass = (key: string) =>
    errors[key]
      ? "mt-1 w-full rounded-lg border border-red-400 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300/30 focus:border-red-400"
      : "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]";

  const fieldError = (key: string) =>
    errors[key] ? <p className="mt-1 text-xs font-medium text-red-600">{errors[key]}</p> : null;

  const hasErrors = Object.keys(errors).length > 0;

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
                <th className="px-6 py-4">Jadwal</th>
                <th className="px-6 py-4">Harga</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-400">Memuat data...</td></tr>
              ) : tripRows.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-400">Belum ada data trip.</td></tr>
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
                    <td className="px-6 py-4 text-slate-500">{t.startDate ? formatDate(t.startDate) : "-"}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {t.priceMin ? formatRupiah(t.priceMin) : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${t.status === "published" ? "bg-[#1CA6B7]/15 text-[#1CA6B7]" : t.status === "draft" ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-700"}`}>
                        {t.status}
                      </span>
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
          {hasErrors && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-xs font-bold text-red-700">
                Form belum lengkap. Periksa field yang ditandai merah sebelum menyimpan:
              </p>
              <ul className="list-disc ml-4 mt-1 space-y-0.5">
                {Object.values(errors).map((msg, i) => (
                  <li key={i} className="text-xs text-red-600">{msg}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Judul Trip</label>
              <input name="title" value={form.title} onChange={handleChange} required
                className={fieldClass("title")} />
              {fieldError("title")}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Slug</label>
              <input name="slug" value={form.slug} onChange={handleChange}
                className={fieldClass("slug") + " text-slate-500 bg-slate-50"} />
              {fieldError("slug")}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Durasi (Hari)</label>
              <input name="durationDays" type="number" min={1} value={form.durationDays} onChange={handleChange} required
                className={fieldClass("durationDays")} />
              {fieldError("durationDays")}
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
                  className={fieldClass("province")}
                >
                  <option value="">Pilih Provinsi</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {fieldError("province")}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Lokasi Utama</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Contoh: Kintamani, Ubud"
                  className={fieldClass("location")}
                />
                {fieldError("location")}
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
                      borderColor: errors.categoryId ? "#f87171" : "#cbd5e1",
                      minHeight: "38px",
                      boxShadow: "none",
                      "&:hover": { borderColor: errors.categoryId ? "#ef4444" : "#F49D1A" },
                    }),
                  }}
                />
                {fieldError("categoryId")}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Harga (Rp)</label>
                <input
                  type="text"
                  value={formatRupiah(form.price)}
                  onChange={handlePriceChange}
                  placeholder="Rp 0"
                  className={fieldClass("price")}
                />
                {fieldError("price")}
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

          <div className="border-t border-slate-200 pt-5 space-y-4">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Fasilitas Trip</h3>
                  <span className="bg-amber-100 text-[#F49D1A] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                    {facilitiesList.length} Fasilitas
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kelola fasilitas dan pilih ikon visual untuk mempermudah informasi ke lansia.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {facilitiesList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFacilitiesList([])}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                  >
                    Hapus Semua
                  </button>
                )}
                <button
                  type="button"
                  onClick={addFacilityItem}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-[#F49D1A] hover:bg-[#d68512] rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Fasilitas</span>
                </button>
              </div>
            </div>

            {/* Facility Items List */}
            {facilitiesList.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-amber-100/80 text-[#F49D1A] flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">Belum ada fasilitas yang ditambahkan</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Klik tombol &quot;Tambah Fasilitas&quot; untuk menambahkan item fasilitas baru.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 p-0.5">
                {facilitiesList.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2.5 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 hover:border-amber-300 shadow-2xs transition group relative hover:z-30 focus-within:z-30"
                  >
                    {/* Index Badge */}
                    <span className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>

                    {/* Icon Selector */}
                    <div className="shrink-0">
                      <IconPicker
                        variant="icon-only"
                        value={item.icon}
                        onChange={(newIcon) => handleFacilityChange(index, "icon", newIcon)}
                      />
                    </div>

                    {/* Facility Name Input */}
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleFacilityChange(index, "name", e.target.value)}
                        placeholder="Nama Fasilitas (cth: Bus AC Executive, Tour Guide, Medis)"
                        className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A] font-medium transition flex items-center"
                      />
                    </div>

                    {/* Delete Action Button */}
                    <button
                      type="button"
                      onClick={() => removeFacilityItem(index)}
                      className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition shrink-0"
                      title="Hapus Fasilitas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Jadwal Keberangkatan</h3>
                <p className="text-xs text-slate-500">Satu trip bisa punya beberapa jadwal. Harga per jadwal mengikuti input Harga di atas.</p>
              </div>
              <button
                type="button"
                onClick={addDepartureItem}
                className="px-3 py-1.5 text-xs font-semibold text-[#F49D1A] bg-[#F49D1A]/10 hover:bg-[#F49D1A]/20 rounded-xl transition inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Jadwal</span>
              </button>
            </div>

            {errors.departures && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2">
                <p className="text-xs font-medium text-red-600">{errors.departures}</p>
              </div>
            )}

            {departuresList.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                Belum ada jadwal keberangkatan. Klik tombol di atas untuk menambah jadwal.
              </p>
            ) : (
              <div className="space-y-3">
                {departuresList.map((item, index) => (
                  <div key={index} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        Jadwal #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeDepartureItem(index)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Hapus Jadwal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">Tanggal Keberangkatan *</label>
                        <input
                          type="date"
                          value={item.startDate}
                          onChange={(e) => handleDepartureChange(index, "startDate", e.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">Kuota Maksimal</label>
                        <input
                          type="number"
                          min={1}
                          value={item.maxParticipants}
                          onChange={(e) => handleDepartureChange(index, "maxParticipants", Number(e.target.value))}
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Meeting Point</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Jam Kumpul *</label>
                <input name="meetingPointTime" type="time" value={form.meetingPointTime} onChange={handleChange}
                  className={fieldClass("meetingPointTime")} />
                {fieldError("meetingPointTime")}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Lokasi Kumpul *</label>
                <input name="meetingPoint" value={form.meetingPoint} onChange={handleChange}
                  placeholder="Contoh: Bandara Soekarno-Hatta Terminal 3"
                  className={fieldClass("meetingPoint")} />
                {fieldError("meetingPoint")}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Titik kumpul peserta sebelum keberangkatan. Akan muncul di halaman checkout.</p>
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
