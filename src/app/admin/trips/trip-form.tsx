"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/shared/utils/helpers";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface Destination {
  id: string;
  name: string;
}

interface ItineraryItem {
  id?: string;
  dayNumber: number;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  destinationId: string;
}

interface TripDestination {
  destinationId: string;
  dayOrder: number;
  durationHours: number;
  notes: string;
}

export default function TripForm({ initial, onSuccess }: { initial?: any; onSuccess?: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState(initial || { title: "", type: "open_trip", durationDays: 1, description: "", status: "draft" });
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(initial?.itinerary ?? []);
  const [tripDestinations, setTripDestinations] = useState<TripDestination[]>(initial?.tripDestinations ?? []);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/destinations")
      .then((r) => r.json())
      .then(setDestinations)
      .catch(() => {});
  }, []);

  function updateForm(partial: Record<string, any>) {
    setForm({ ...form, ...partial });
  }

  // --- Trip Destinations ---
  function addDestination() {
    setTripDestinations([...tripDestinations, { destinationId: "", dayOrder: tripDestinations.length + 1, durationHours: 2, notes: "" }]);
  }

  function updateDestination(idx: number, partial: Partial<TripDestination>) {
    const next = [...tripDestinations];
    next[idx] = { ...next[idx], ...partial };
    setTripDestinations(next);
  }

  function removeDestination(idx: number) {
    setTripDestinations(tripDestinations.filter((_, i) => i !== idx));
  }

  // --- Itinerary ---
  function addItineraryItem(dayNumber: number) {
    setItinerary([...itinerary, { dayNumber, startTime: "08:00", endTime: "09:00", title: "", description: "", destinationId: "" }]);
  }

  function updateItinerary(idx: number, partial: Partial<ItineraryItem>) {
    const next = [...itinerary];
    next[idx] = { ...next[idx], ...partial };
    setItinerary(next);
  }

  function removeItinerary(idx: number) {
    setItinerary(itinerary.filter((_, i) => i !== idx));
  }

  // --- Submit ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      itinerary: itinerary.map(({ id, ...rest }) => rest),
      tripDestinations,
    };
    const url = initial?.id ? `/api/trips/${initial.id}` : "/api/trips";
    const res = await fetch(url, {
      method: initial?.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      if (onSuccess) onSuccess();
      else router.push("/admin/trips");
    }
    setLoading(false);
  }

  const days = Array.from({ length: form.durationDays || 1 }, (_, i) => i + 1);

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {/* === BASIC INFO === */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Informasi Dasar</h2>
        <div>
          <label className="block text-sm font-medium">Judul Trip</label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={form.title}
            onChange={(e) => {
              setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) });
            }}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Tipe</label>
            <select className="mt-1 w-full rounded-lg border px-3 py-2" value={form.type} onChange={(e) => updateForm({ type: e.target.value })}>
              <option value="open_trip">Open Trip</option>
              <option value="private_trip">Private Trip</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Durasi (hari)</label>
            <input type="number" className="mt-1 w-full rounded-lg border px-3 py-2" value={form.durationDays} onChange={(e) => updateForm({ durationDays: +e.target.value })} min={1} required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Deskripsi</label>
          <textarea className="mt-1 w-full rounded-lg border px-3 py-2" rows={4} value={form.description} onChange={(e) => updateForm({ description: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select className="mt-1 w-full rounded-lg border px-3 py-2" value={form.status} onChange={(e) => updateForm({ status: e.target.value })}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </section>

      {/* === DESTINATIONS === */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-lg font-bold text-slate-800">Destinasi Tujuan</h2>
          <button type="button" onClick={addDestination} className="text-sm text-[#e06d26] hover:text-[#c85b18] font-semibold inline-flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Tambah Destinasi
          </button>
        </div>
        {tripDestinations.length === 0 && (
          <p className="text-sm text-slate-400 italic">Belum ada destinasi. Klik &quot;Tambah Destinasi&quot; untuk menambahkan.</p>
        )}
        {tripDestinations.map((d, i) => (
          <div key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <GripVertical className="w-4 h-4 mt-3 text-slate-300 shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-6">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Destinasi</label>
                  <select className="w-full rounded-lg border px-3 py-2 text-sm" value={d.destinationId} onChange={(e) => updateDestination(i, { destinationId: e.target.value })} required>
                    <option value="">Pilih destinasi...</option>
                    {destinations.map((dest) => (
                      <option key={dest.id} value={dest.id}>{dest.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Urutan Hari</label>
                  <input type="number" className="w-full rounded-lg border px-3 py-2 text-sm" value={d.dayOrder} onChange={(e) => updateDestination(i, { dayOrder: +e.target.value })} min={1} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Durasi (jam)</label>
                  <input type="number" className="w-full rounded-lg border px-3 py-2 text-sm" value={d.durationHours} onChange={(e) => updateDestination(i, { durationHours: +e.target.value })} min={0} />
                </div>
                <div className="col-span-2 flex items-end">
                  <button type="button" onClick={() => removeDestination(i)} className="p-2 text-red-400 hover:text-red-600 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Catatan (opsional)" value={d.notes || ""} onChange={(e) => updateDestination(i, { notes: e.target.value })} />
            </div>
          </div>
        ))}
      </section>

      {/* === ITINERARY === */}
      <section className="space-y-4">
        <div className="border-b pb-2">
          <h2 className="text-lg font-bold text-slate-800">Itinerary / Rincian Kegiatan</h2>
        </div>
        {days.map((day) => {
          const dayItems = itinerary.filter((item) => item.dayNumber === day);
          return (
            <div key={day} className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700">Hari {day}</h3>
                <button type="button" onClick={() => addItineraryItem(day)} className="text-xs text-[#e06d26] hover:text-[#c85b18] font-semibold inline-flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Tambah Kegiatan
                </button>
              </div>
              {dayItems.length === 0 && (
                <p className="text-xs text-slate-400 italic">Belum ada kegiatan untuk hari ini.</p>
              )}
              {dayItems.map((item, idx) => {
                const globalIdx = itinerary.indexOf(item);
                return (
                  <div key={globalIdx} className="bg-white rounded-lg border border-slate-200 p-3 space-y-2">
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-5">
                        <label className="block text-xs font-medium text-slate-500 mb-0.5">Judul Kegiatan</label>
                        <input className="w-full rounded-lg border px-2.5 py-1.5 text-sm" value={item.title} onChange={(e) => updateItinerary(globalIdx, { title: e.target.value })} placeholder="Nama kegiatan" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-0.5">Mulai</label>
                        <input type="time" className="w-full rounded-lg border px-2.5 py-1.5 text-sm" value={item.startTime} onChange={(e) => updateItinerary(globalIdx, { startTime: e.target.value })} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-0.5">Selesai</label>
                        <input type="time" className="w-full rounded-lg border px-2.5 py-1.5 text-sm" value={item.endTime} onChange={(e) => updateItinerary(globalIdx, { endTime: e.target.value })} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-0.5">Destinasi</label>
                        <select className="w-full rounded-lg border px-2.5 py-1.5 text-sm" value={item.destinationId} onChange={(e) => updateItinerary(globalIdx, { destinationId: e.target.value })}>
                          <option value="">-</option>
                          {destinations.map((dest) => (
                            <option key={dest.id} value={dest.id}>{dest.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1 flex items-end justify-center">
                        <button type="button" onClick={() => removeItinerary(globalIdx)} className="p-1.5 text-red-400 hover:text-red-600 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <textarea className="w-full rounded-lg border px-2.5 py-1.5 text-sm" rows={2} value={item.description} onChange={(e) => updateItinerary(globalIdx, { description: e.target.value })} placeholder="Deskripsi kegiatan (opsional)" />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </section>

      {/* === SUBMIT === */}
      <div className="flex items-center gap-3 pt-2 border-t">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#e06d26] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:bg-[#c85b18] transition disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          type="button"
          onClick={() => onSuccess ? onSuccess() : router.push("/admin/trips")}
          className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
