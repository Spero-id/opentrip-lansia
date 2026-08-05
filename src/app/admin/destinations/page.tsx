"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Plus, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { slugify } from "@/shared/utils/helpers";
import Modal from "../components/modal";
import ConfirmDelete from "../components/confirm-delete";
import ImageManager from "./image-manager";

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

interface ItineraryItem {
  day: number;
  title: string;
  description: string;
}

interface MeetingPointItem {
  time: string;
  location: string;
  description: string;
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
  image: string | null;
  images: string[] | null;
  priceMin: number | null;
  priceMax: number | null;
  itinerary: ItineraryItem[] | null;
  meetingPoints: MeetingPointItem[] | null;
  facilities: string[] | null;
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
  image: string;
  images: string[];
  priceMin: number | null;
  priceMax: number | null;
  itinerary: ItineraryItem[];
  meetingPoints: MeetingPointItem[];
  facilities: string[];
}

const emptyForm: DestinationForm = {
  name: "", slug: "", description: "", location: "", geoPoint: "", categoryId: "",
  difficultyLevel: "", isActive: true, visitEstimateMinutes: null,
  image: "", images: [], priceMin: null, priceMax: null, itinerary: [], meetingPoints: [], facilities: [],
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
      image: item.image || "",
      images: item.images ?? [],
      priceMin: item.priceMin,
      priceMax: item.priceMax,
      itinerary: item.itinerary ?? [],
      meetingPoints: item.meetingPoints ?? [],
      facilities: item.facilities ?? [],
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
        image: form.image || null,
        images: form.images.length ? form.images : null,
        priceMin: form.priceMin || null,
        priceMax: form.priceMax || null,
        itinerary: form.itinerary.length ? form.itinerary : null,
        meetingPoints: form.meetingPoints.length ? form.meetingPoints : null,
        facilities: form.facilities.length ? form.facilities : null,
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

  function updateItinerary(idx: number, field: keyof ItineraryItem, value: string | number) {
    setForm(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    }));
  }

  function addItinerary() {
    setForm(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, { day: prev.itinerary.length + 1, title: "", description: "" }],
    }));
  }

  function removeItinerary(idx: number) {
    setForm(prev => ({ ...prev, itinerary: prev.itinerary.filter((_, i) => i !== idx) }));
  }

  function updateMeetingPoint(idx: number, field: keyof MeetingPointItem, value: string) {
    setForm(prev => ({
      ...prev,
      meetingPoints: prev.meetingPoints.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    }));
  }

  function addMeetingPoint() {
    setForm(prev => ({
      ...prev,
      meetingPoints: [...prev.meetingPoints, { time: "", location: "", description: "" }],
    }));
  }

  function removeMeetingPoint(idx: number) {
    setForm(prev => ({ ...prev, meetingPoints: prev.meetingPoints.filter((_, i) => i !== idx) }));
  }

  function updateFacility(idx: number, value: string) {
    setForm(prev => ({
      ...prev,
      facilities: prev.facilities.map((item, i) => (i === idx ? value : item)),
    }));
  }

  function addFacility() {
    setForm(prev => ({ ...prev, facilities: [...prev.facilities, ""] }));
  }

  function removeFacility(idx: number) {
    setForm(prev => ({ ...prev, facilities: prev.facilities.filter((_, i) => i !== idx) }));
  }

  const catMap = categories.reduce<Record<string, string>>((acc, c) => { acc[c.id] = c.name; return acc; }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manajemen Destinasi</h1>
          <p className="text-sm text-slate-500 mt-1">Daftar lokasi wisata & fisik lansia yang tersedia di Jelajah Memoria.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-2xl bg-[#F49D1A] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#F49D1A]/20 hover:bg-[#c47d12] transition inline-flex items-center gap-2 shrink-0"
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
                <th className="px-6 py-4">Gambar</th>
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
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">Memuat data...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">Belum ada data destinasi.</td></tr>
              ) : (
                rows.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      {d.image ? (
                        <img src={d.image} alt={d.name} className="w-14 h-14 rounded-xl object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300 text-[10px]">
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{d.name}</div>
                      {d.description && <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 max-w-[240px]">{d.description}</div>}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{d.location || "-"}</td>
                    <td className="px-6 py-4 text-slate-500">{d.categoryId ? catMap[d.categoryId] || "-" : "-"}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{d.difficultyLevel || "-"}</td>
                    <td className="px-6 py-4">
                      {d.isActive ? (
                        <span className="inline-flex items-center gap-1 bg-[#1CA6B7]/15 text-[#1CA6B7] px-2.5 py-1 rounded-full text-[10px] font-bold">
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
                        <button onClick={() => openEdit(d)} className="p-2 text-slate-500 hover:text-[#F49D1A] hover:bg-[#F49D1A]/10 rounded-xl transition" title="Edit Destinasi">
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
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Slug</label>
            <input name="slug" value={form.slug} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Deskripsi</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Lokasi</label>
              <input name="location" value={form.location} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Kategori</label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]">
                <option value="">-- Pilih Kategori --</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Latitude</label>
              <input type="number" step="any"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
                value={latitude ?? ""} onChange={(e) => handleLatLngChange("lat", e.target.value)}
                placeholder="-8.12345" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Longitude</label>
              <input type="number" step="any"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
                value={longitude ?? ""} onChange={(e) => handleLatLngChange("lng", e.target.value)}
                placeholder="114.12345" />
            </div>
          </div>
          <MapPicker latitude={latitude} longitude={longitude} onChange={handleMapChange} />
          <ImageManager
            cover={form.image || null}
            images={form.images}
            onChange={(next) => setForm(prev => ({ ...prev, image: next.cover ?? "", images: next.images }))}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Tingkat Kesulitan</label>
              <select name="difficultyLevel" value={form.difficultyLevel} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]">
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
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" min={0} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Harga Min (Rp)</label>
              <input name="priceMin" type="number" min={0}
                value={form.priceMin ?? ""}
                onChange={e => setForm(prev => ({ ...prev, priceMin: e.target.value ? Number(e.target.value) : null }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Harga Max (Rp)</label>
              <input name="priceMax" type="number" min={0}
                value={form.priceMax ?? ""}
                onChange={e => setForm(prev => ({ ...prev, priceMax: e.target.value ? Number(e.target.value) : null }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-slate-700">Itinerary (Rencana Perjalanan)</label>
              <button type="button" onClick={addItinerary}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#F49D1A] hover:text-[#c47d12] transition">
                <Plus className="w-3.5 h-3.5" /> Tambah Hari
              </button>
            </div>
            {form.itinerary.length === 0 && (
              <p className="text-xs text-slate-400">Belum ada itinerary. Klik &quot;Tambah Hari&quot; untuk mulai.</p>
            )}
            {form.itinerary.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-slate-200 p-3 space-y-2">
                <div className="flex gap-2">
                  <input type="number" min={1} value={item.day}
                    onChange={(e) => updateItinerary(idx, "day", Number(e.target.value))}
                    className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
                  <input value={item.title}
                    onChange={(e) => updateItinerary(idx, "title", e.target.value)}
                    placeholder="Judul kegiatan"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
                  <button type="button" onClick={() => removeItinerary(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus baris">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea value={item.description}
                  onChange={(e) => updateItinerary(idx, "description", e.target.value)}
                  placeholder="Deskripsi kegiatan hari ini"
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-slate-700">Titik Kumpul</label>
              <button type="button" onClick={addMeetingPoint}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#F49D1A] hover:text-[#c47d12] transition">
                <Plus className="w-3.5 h-3.5" /> Tambah Titik Kumpul
              </button>
            </div>
            {form.meetingPoints.length === 0 && (
              <p className="text-xs text-slate-400">Belum ada titik kumpul. Klik &quot;Tambah Titik Kumpul&quot; untuk mulai.</p>
            )}
            {form.meetingPoints.map((mp, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-slate-200 p-3 space-y-2">
                <div className="flex gap-2">
                  <input value={mp.time}
                    onChange={(e) => updateMeetingPoint(idx, "time", e.target.value)}
                    placeholder="Jam (mis. 08:00)"
                    className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
                  <input value={mp.location}
                    onChange={(e) => updateMeetingPoint(idx, "location", e.target.value)}
                    placeholder="Lokasi"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
                  <button type="button" onClick={() => removeMeetingPoint(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus baris">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea value={mp.description}
                  onChange={(e) => updateMeetingPoint(idx, "description", e.target.value)}
                  placeholder="Deskripsi titik kumpul"
                  rows={1}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-slate-700">Fasilitas</label>
              <button type="button" onClick={addFacility}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#F49D1A] hover:text-[#c47d12] transition">
                <Plus className="w-3.5 h-3.5" /> Tambah Fasilitas
              </button>
            </div>
            {form.facilities.length === 0 && (
              <p className="text-xs text-slate-400">Belum ada fasilitas. Klik &quot;Tambah Fasilitas&quot; untuk mulai.</p>
            )}
            {form.facilities.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input value={item}
                  onChange={(e) => updateFacility(idx, e.target.value)}
                  placeholder="Nama fasilitas (mis. Kursi roda, Ramp, Toilet khusus lansia)"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]" />
                <button type="button" onClick={() => removeFacility(idx)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus baris">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange}
              className="w-4 h-4 rounded border-slate-300 text-[#F49D1A] focus:ring-[#F49D1A]/30" />
            <span className="font-medium text-slate-700">Aktif</span>
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
