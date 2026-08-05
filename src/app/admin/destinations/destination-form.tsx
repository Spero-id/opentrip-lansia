"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Plus, Trash2 } from "lucide-react";
import { slugify } from "@/shared/utils/helpers";
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

interface DestinationFormData {
  name: string;
  slug: string;
  description: string | null;
  accessibilityInfo: string | null;
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

export default function DestinationForm({
  initial,
  categories: initialCategories,
}: {
  initial?: Partial<DestinationFormData> & { id?: string };
  categories?: Category[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [form, setForm] = useState<DestinationFormData>({
    name: initial?.name || "",
    slug: initial?.slug || "",
    description: initial?.description ?? "",
    accessibilityInfo: initial?.accessibilityInfo ?? "",
    location: initial?.location ?? "",
    geoPoint: initial?.geoPoint ?? "",
    categoryId: initial?.categoryId ?? "",
    difficultyLevel: initial?.difficultyLevel ?? "",
    isActive: initial?.isActive ?? true,
    visitEstimateMinutes: initial?.visitEstimateMinutes ?? null,
    image: initial?.image ?? null,
    images: initial?.images ?? [],
    priceMin: initial?.priceMin ?? null,
    priceMax: initial?.priceMax ?? null,
    itinerary: initial?.itinerary ?? [],
    meetingPoints: initial?.meetingPoints ?? [],
    facilities: initial?.facilities ?? [],
  });
  const [loading, setLoading] = useState(false);

  const parsedInitial = parseGeoPoint(initial?.geoPoint ?? null);
  const [latitude, setLatitude] = useState<number | null>(parsedInitial.lat);
  const [longitude, setLongitude] = useState<number | null>(parsedInitial.lng);

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

  useEffect(() => {
    if (!initialCategories) {
      fetch("/api/destinations/categories")
        .then((r) => r.json())
        .then(setCategories)
        .catch(() => {});
    }
  }, [initialCategories]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const target = e.target;
    const { name } = target;
    const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "visitEstimateMinutes" || name === "priceMin" || name === "priceMax"
          ? value
            ? Number(value)
            : null
          : value,
      ...(name === "name" && !initial ? { slug: slugify(target.value) } : {}),
    }));
  }

  function updateItinerary(idx: number, field: keyof ItineraryItem, value: string | number) {
    setForm((prev) => ({
      ...prev,
      itinerary: (prev.itinerary ?? []).map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    }));
  }

  function addItinerary() {
    setForm((prev) => ({
      ...prev,
      itinerary: [...(prev.itinerary ?? []), { day: (prev.itinerary ?? []).length + 1, title: "", description: "" }],
    }));
  }

  function removeItinerary(idx: number) {
    setForm((prev) => ({ ...prev, itinerary: (prev.itinerary ?? []).filter((_, i) => i !== idx) }));
  }

  function updateMeetingPoint(idx: number, field: keyof MeetingPointItem, value: string) {
    setForm((prev) => ({
      ...prev,
      meetingPoints: (prev.meetingPoints ?? []).map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    }));
  }

  function addMeetingPoint() {
    setForm((prev) => ({
      ...prev,
      meetingPoints: [...(prev.meetingPoints ?? []), { time: "", location: "", description: "" }],
    }));
  }

  function removeMeetingPoint(idx: number) {
    setForm((prev) => ({ ...prev, meetingPoints: (prev.meetingPoints ?? []).filter((_, i) => i !== idx) }));
  }

  function updateFacility(idx: number, value: string) {
    setForm((prev) => ({
      ...prev,
      facilities: (prev.facilities ?? []).map((item, i) => (i === idx ? value : item)),
    }));
  }

  function addFacility() {
    setForm((prev) => ({ ...prev, facilities: [...(prev.facilities ?? []), ""] }));
  }

  function removeFacility(idx: number) {
    setForm((prev) => ({ ...prev, facilities: (prev.facilities ?? []).filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const url = initial?.id ? `/api/destinations/${initial.id}` : "/api/destinations";
    const res = await fetch(url, {
      method: initial?.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        visitEstimateMinutes: form.visitEstimateMinutes || null,
        categoryId: form.categoryId || null,
        slug: form.slug || slugify(form.name) + "-" + Date.now(),
        image: form.image || null,
        images: form.images?.length ? form.images : null,
        priceMin: form.priceMin || null,
        priceMax: form.priceMax || null,
        itinerary: form.itinerary?.length ? form.itinerary : null,
        meetingPoints: form.meetingPoints?.length ? form.meetingPoints : null,
        facilities: form.facilities?.length ? form.facilities : null,
        accessibilityInfo: form.accessibilityInfo || null,
      }),
    });
    if (res.ok) router.push("/admin/destinations");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Nama Destinasi</label>
        <input
          name="name"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Slug</label>
        <input
          name="slug"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
          value={form.slug}
          onChange={handleChange}
          placeholder="Auto-generated from name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Deskripsi</label>
        <textarea
          name="description"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
          rows={4}
          value={form.description ?? ""}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Aksesibilitas</label>
        <textarea
          name="accessibilityInfo"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
          rows={3}
          value={form.accessibilityInfo ?? ""}
          onChange={handleChange}
          placeholder="Deskripsi aksesibilitas (mis. Tersedia kursi roda, area istirahat setiap 100m)"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Lokasi</label>
          <input
            name="location"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
            value={form.location ?? ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Kategori</label>
          <select
            name="categoryId"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
            value={form.categoryId ?? ""}
            onChange={handleChange}
          >
            <option value="">-- Pilih Kategori --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Tingkat Kesulitan</label>
          <select
            name="difficultyLevel"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
            value={form.difficultyLevel ?? ""}
            onChange={handleChange}
          >
            <option value="">-- Pilih --</option>
            <option value="Mudah">Mudah</option>
            <option value="Sedang">Sedang</option>
            <option value="Sulit">Sulit</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Estimasi Kunjungan (menit)</label>
          <input
            name="visitEstimateMinutes"
            type="number"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
            value={form.visitEstimateMinutes ?? ""}
            onChange={handleChange}
            min={0}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Harga Min (Rp)</label>
          <input
            name="priceMin"
            type="number"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
            value={form.priceMin ?? ""}
            onChange={handleChange}
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Harga Max (Rp)</label>
          <input
            name="priceMax"
            type="number"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
            value={form.priceMax ?? ""}
            onChange={handleChange}
            min={0}
          />
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
        {(form.itinerary ?? []).length === 0 && (
          <p className="text-xs text-slate-400">Belum ada itinerary. Klik &quot;Tambah Hari&quot; untuk mulai.</p>
        )}
        {(form.itinerary ?? []).map((item, idx) => (
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
        {(form.meetingPoints ?? []).length === 0 && (
          <p className="text-xs text-slate-400">Belum ada titik kumpul. Klik &quot;Tambah Titik Kumpul&quot; untuk mulai.</p>
        )}
        {(form.meetingPoints ?? []).map((mp, idx) => (
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Latitude</label>
          <input
            type="number"
            step="any"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
            value={latitude ?? ""}
            onChange={(e) => handleLatLngChange("lat", e.target.value)}
            placeholder="-8.12345"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Longitude</label>
          <input
            type="number"
            step="any"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
            value={longitude ?? ""}
            onChange={(e) => handleLatLngChange("lng", e.target.value)}
            placeholder="114.12345"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Peta</label>
        <MapPicker latitude={latitude} longitude={longitude} onChange={handleMapChange} />
      </div>

      <ImageManager
        cover={form.image}
        images={form.images ?? []}
        onChange={(next) => setForm((prev) => ({ ...prev, image: next.cover, images: next.images }))}
      />

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-medium text-slate-700">Fasilitas</label>
          <button type="button" onClick={addFacility}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#F49D1A] hover:text-[#c47d12] transition">
            <Plus className="w-3.5 h-3.5" /> Tambah Fasilitas
          </button>
        </div>
        {(form.facilities ?? []).length === 0 && (
          <p className="text-xs text-slate-400">Belum ada fasilitas. Klik &quot;Tambah Fasilitas&quot; untuk mulai.</p>
        )}
        {(form.facilities ?? []).map((item, idx) => (
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
        <input
          name="isActive"
          type="checkbox"
          className="w-4 h-4 rounded border-slate-300 text-[#F49D1A] focus:ring-[#F49D1A]/30"
          checked={form.isActive ?? false}
          onChange={handleChange}
        />
        <span className="font-medium text-slate-700">Aktif</span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#F49D1A] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#F49D1A]/20 hover:bg-[#c47d12] transition disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/destinations")}
          className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
