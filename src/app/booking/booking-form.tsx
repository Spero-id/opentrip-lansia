"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Baby, Ticket, ArrowRight, Users } from "lucide-react";

interface Price {
  id: string;
  name: string;
  price: string;
  quota: number;
  quotaBooked: number | null;
}

interface Participant {
  key: number;
  fullName: string;
  phone: string;
  isChild: boolean;
}

export default function BookingForm({ departureId, prices }: { departureId: string; prices: Price[] }) {
  const router = useRouter();
  const [items, setItems] = useState(prices.map((p) => ({ priceId: p.id, name: p.name, price: p.price, qty: 0 })));
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = items.reduce((sum, i) => sum + parseInt(i.price) * i.qty, 0);
  const totalPax = items.reduce((sum, i) => sum + i.qty, 0);

  // Keep participants array in sync with totalPax
  const prevTotalPax = useRef(totalPax);
  useEffect(() => {
    const current = prevTotalPax.current;
    if (totalPax === current) return;
    prevTotalPax.current = totalPax;

    if (totalPax > current) {
      // Add new participants
      const added: Participant[] = [];
      for (let i = current; i < totalPax; i++) {
        added.push({ key: i, fullName: "", phone: "", isChild: false });
      }
      setParticipants((prev) => [...prev, ...added]);
    } else if (totalPax < current) {
      // Remove excess participants from the end
      setParticipants((prev) => prev.slice(0, totalPax));
    }
  }, [totalPax]);

  function updateParticipant(key: number, field: keyof Participant, value: string | boolean) {
    setParticipants((prev) => prev.map((p) => (p.key === key ? { ...p, [field]: value } : p)));
  }

  function validateParticipants(): string | null {
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      if (!p.fullName.trim()) {
        return `Nama peserta ke-${i + 1} wajib diisi`;
      }
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (totalPax === 0) {
      setError("Pilih minimal 1 tiket untuk melanjutkan.");
      return;
    }

    const validationErr = validateParticipants();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departureId,
          items: items.filter((i) => i.qty > 0),
          participants: participants.map((p) => ({
            fullName: p.fullName.trim(),
            phone: p.isChild ? "" : p.phone.trim(),
            isChild: p.isChild,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/booking/${data.id}/payment`);
      } else {
        setError(data.error || "Terjadi kesalahan saat memproses booking");
        setLoading(false);
      }
    } catch {
      setError("Gagal menghubungi server");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* 1. Pilih Tiket */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-[#e06d26]" />
          <span>Pilih Jumlah Tiket</span>
        </h2>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={item.priceId}
              className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 bg-slate-50/50 hover:border-orange-200 transition"
            >
              <div>
                <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                <p className="text-xs font-semibold text-[#e06d26] mt-0.5">
                  Rp {parseInt(item.price).toLocaleString("id-ID")} <span className="text-slate-400 font-normal">/ pax</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={prices[idx]?.quota ? prices[idx].quota - (prices[idx].quotaBooked || 0) : 10}
                  className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-800 focus:outline-hidden focus:border-[#e06d26]"
                  value={item.qty}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx] = { ...item, qty: Math.max(0, +e.target.value) };
                    setItems(newItems);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Data Peserta */}
      {totalPax > 0 && (
        <div className="space-y-5 pt-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#e06d26]" />
            <span>Data {totalPax} Peserta</span>
          </h2>

          <div className="space-y-4">
            {participants.map((p, idx) => (
              <div
                key={p.key}
                className="rounded-2xl border border-slate-200 p-5 bg-white space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#e06d26]/10 text-[#e06d26] text-xs font-bold">
                      {idx + 1}
                    </span>
                    Peserta #{idx + 1}
                  </h3>
                  {/* Child toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-[#e06d26] focus:ring-[#e06d26]/30"
                      checked={p.isChild}
                      onChange={(e) => updateParticipant(p.key, "isChild", e.target.checked)}
                    />
                    <Baby className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-medium text-slate-500">Anak-anak</span>
                  </label>
                </div>

                {/* Nama */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={p.isChild ? "Nama anak" : "Sesuai KTP / SIM"}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-hidden focus:border-[#e06d26] focus:ring-2 focus:ring-orange-500/20 transition pl-11"
                      value={p.fullName}
                      onChange={(e) => updateParticipant(p.key, "fullName", e.target.value)}
                      required
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Phone (only for non-child) */}
                {!p.isChild && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nomor Telepon / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="Contoh: 081234567890"
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-hidden focus:border-[#e06d26] focus:ring-2 focus:ring-orange-500/20 transition pl-11"
                        value={p.phone}
                        onChange={(e) => updateParticipant(p.key, "phone", e.target.value)}
                        required
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                )}

                {/* Child notice */}
                {p.isChild && (
                  <div className="rounded-xl bg-sky-50 border border-sky-100 px-4 py-2.5">
                    <p className="text-xs text-sky-700 flex items-center gap-1.5">
                      <Baby className="w-3.5 h-3.5" />
                      Peserta anak-anak — hanya nama yang diperlukan.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-600 border border-red-100">
          {error}
        </div>
      )}

      {/* Summary Box */}
      <div className="rounded-2xl bg-orange-50/80 p-5 border border-orange-100 space-y-2">
        <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
          <span>Jumlah Peserta</span>
          <span>{totalPax} Peserta</span>
        </div>
        <div className="flex justify-between items-center text-lg font-extrabold text-slate-900 pt-2 border-t border-orange-200/60">
          <span>Total Pembayaran</span>
          <span className="text-[#e06d26]">Rp {total.toLocaleString("id-ID")}</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || totalPax === 0}
        className="w-full rounded-2xl bg-[#e06d26] py-4 text-white font-bold shadow-lg shadow-orange-500/25 hover:bg-[#c85b18] active:scale-98 transition duration-200 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
      >
        <span>{loading ? "Memproses..." : "Lanjut ke Pembayaran"}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

    </form>
  );
}
