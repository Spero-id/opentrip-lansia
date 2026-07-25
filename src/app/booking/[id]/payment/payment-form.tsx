"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentForm({ bookingId, amount }: { bookingId: string; amount: string }) {
  const router = useRouter();
  const [method, setMethod] = useState("transfer_manual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, method, amount }),
    });

    const data = await res.json();
    if (res.ok) {
      router.push(`/booking/${bookingId}/success`);
    } else {
      setError(data.error || "Terjadi kesalahan");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium">Metode Pembayaran</label>
        <select className="mt-1 w-full rounded-lg border px-3 py-2" value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="transfer_manual">Transfer Manual</option>
          <option value="midtrans">Midtrans</option>
        </select>
      </div>
      {method === "transfer_manual" && (
        <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
          Transfer ke rekening BNI: <strong>1234567890</strong> a.n. Open Trip Lansia
          <br />Konfirmasi via WhatsApp setelah transfer.
        </div>
      )}
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary py-3 text-white hover:bg-primary-dark disabled:opacity-50">
        {loading ? "Memproses..." : "Konfirmasi Pembayaran"}
      </button>
    </form>
  );
}
