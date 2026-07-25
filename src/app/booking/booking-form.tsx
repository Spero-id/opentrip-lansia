"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Ticket, ArrowRight } from "lucide-react";

interface Price {
  id: string;
  name: string;
  price: string;
  quota: number;
  quotaBooked: number | null;
}

export default function BookingForm({ departureId, prices }: { departureId: string; prices: Price[] }) {
  const router = useRouter();
  const [items, setItems] = useState(prices.map((p) => ({ priceId: p.id, name: p.name, price: p.price, qty: 0 })));
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = items.reduce((sum, i) => sum + parseInt(i.price) * i.qty, 0);
  const totalPax = items.reduce((sum, i) => sum + i.qty, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (totalPax === 0) {
      setError("Pilih minimal 1 tiket untuk melanjutkan.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ departureId, items: items.filter((i) => i.qty > 0), fullName, phone }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/booking/${data.id}/payment`);
      } else {
        setError(data.error || "Terjadi kesalahan saat memproses booking");
        setLoading(false);
      }
    } catch (err) {
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

      {/* 2. Data Pemesan */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-[#e06d26]" />
          <span>Informasi Kontak Pemesan</span>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Lengkap Pemesan</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Sesuai KTP / SIM"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-hidden focus:border-[#e06d26] focus:ring-2 focus:ring-orange-500/20 transition pl-11"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nomor Telepon / WhatsApp</label>
            <div className="relative">
              <input
                type="tel"
                placeholder="Contoh: 081234567890"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-hidden focus:border-[#e06d26] focus:ring-2 focus:ring-orange-500/20 transition pl-11"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

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
