"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { slugify } from "@/shared/utils/helpers";

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

interface DestinationFormData {
  name: string;
  slug: string;
  description: string | null;
  location: string | null;
  geoPoint: string | null;
  categoryId: string | null;
  difficultyLevel: string | null;
  accessibilityInfo: string | null;
  isActive: boolean | null;
  visitEstimateMinutes: number | null;
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
    location: initial?.location ?? "",
    geoPoint: initial?.geoPoint ?? "",
    categoryId: initial?.categoryId ?? "",
    difficultyLevel: initial?.difficultyLevel ?? "",
    accessibilityInfo: initial?.accessibilityInfo ?? "",
    isActive: initial?.isActive ?? true,
    visitEstimateMinutes: initial?.visitEstimateMinutes ?? null,
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
      [name]: name === "visitEstimateMinutes" ? (value ? Number(value) : null) : value,
      ...(name === "name" && !initial ? { slug: slugify(target.value) } : {}),
    }));
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
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Slug</label>
        <input
          name="slug"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]"
          value={form.slug}
          onChange={handleChange}
          placeholder="Auto-generated from name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Deskripsi</label>
        <textarea
          name="description"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]"
          rows={4}
          value={form.description ?? ""}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Lokasi</label>
          <input
            name="location"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]"
            value={form.location ?? ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Kategori</label>
          <select
            name="categoryId"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]"
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Tingkat Kesulitan</label>
          <select
            name="difficultyLevel"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]"
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
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]"
            value={form.visitEstimateMinutes ?? ""}
            onChange={handleChange}
            min={0}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Latitude</label>
          <input
            type="number"
            step="any"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]"
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
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]"
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

      <div>
        <label className="block text-sm font-medium text-slate-700">Informasi Aksesibilitas</label>
        <textarea
          name="accessibilityInfo"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e06d26]/30 focus:border-[#e06d26]"
          rows={2}
          value={form.accessibilityInfo ?? ""}
          onChange={handleChange}
        />
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          name="isActive"
          type="checkbox"
          className="w-4 h-4 rounded border-slate-300 text-[#e06d26] focus:ring-[#e06d26]/30"
          checked={form.isActive ?? false}
          onChange={handleChange}
        />
        <span className="font-medium text-slate-700">Aktif</span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#e06d26] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:bg-[#c85b18] transition disabled:opacity-50"
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
