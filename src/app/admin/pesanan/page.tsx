"use client";

import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import Modal from "../components/modal";

interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  status: string;
  totalParticipants: number;
  totalAmount: string;
  currency: string;
  bookingDate: string;
  notes: string | null;
}

interface NotesInfo {
  destinationName?: string;
  destinationId?: number;
  travelDate?: string;
  meetingPointId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  specialRequest?: string;
}

const statusBadge: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800",
  },
  confirmed: {
    label: "Dikonfirmasi",
    className: "bg-[#1CA6B7]/15 text-[#1CA6B7]",
  },
  cancelled: {
    label: "Dibatalkan",
    className: "bg-red-100 text-red-800",
  },
  completed: {
    label: "Selesai",
    className: "bg-blue-100 text-blue-800",
  },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseNotes(notes: string | null): NotesInfo | null {
  if (!notes) return null;
  try {
    const parsed = JSON.parse(notes);
    if (parsed && typeof parsed === "object" && "destinationName" in parsed) {
      return parsed as NotesInfo;
    }
    return null;
  } catch {
    return null;
  }
}

export default function AdminPesanan() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const res = await fetch("/api/bookings", { credentials: "include" });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data?.error || "Gagal memuat data pesanan.");
          setRows([]);
        } else {
          setError(null);
          setRows(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setError("Gagal memuat data pesanan.");
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  function openDetail(item: Booking) {
    setSelected(item);
    setDetailOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Pesanan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Daftar seluruh pemesanan paket trip oleh pengguna.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-4">Kode Booking</th>
                <th className="px-6 py-4">Peserta</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tanggal Booking</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    Belum ada data pesanan.
                  </td>
                </tr>
              ) : (
                rows.map((b) => {
                  const badge = statusBadge[b.status] ?? {
                    label: b.status,
                    className: "bg-slate-100 text-slate-600",
                  };
                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-50/60 transition"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-[#F49D1A]">
                        {b.bookingCode}
                      </td>
                      <td className="px-6 py-4">
                        {b.totalParticipants} orang
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {b.currency === "IDR"
                          ? `Rp ${Number(b.totalAmount).toLocaleString("id-ID")}`
                          : b.totalAmount}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {formatDate(b.bookingDate)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openDetail(b)}
                          className="p-2 text-slate-500 hover:text-[#F49D1A] hover:bg-[#F49D1A]/10 rounded-xl transition"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Detail Pesanan"
        size="lg"
      >
        {selected && (() => {
          const notesInfo = parseNotes(selected.notes);
          return (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500 font-medium">Kode Booking</p>
                <p className="font-mono font-bold text-[#F49D1A] text-base">
                  {selected.bookingCode}
                </p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Status</p>
                <p>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      statusBadge[selected.status]?.className ??
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {statusBadge[selected.status]?.label ?? selected.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Destinasi</p>
                <p className="font-semibold">
                  {notesInfo?.destinationName ?? "-"}
                </p>
                {notesInfo?.travelDate && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {notesInfo.travelDate}
                  </p>
                )}
              </div>
              <div>
                <p className="text-slate-500 font-medium">Jumlah Peserta</p>
                <p className="font-semibold">
                  {selected.totalParticipants} orang
                </p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Total Pembayaran</p>
                <p className="font-bold text-slate-900">
                  Rp{" "}
                  {Number(selected.totalAmount).toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Tanggal Booking</p>
                <p>{formatDate(selected.bookingDate)}</p>
              </div>
              {notesInfo?.customerName && (
                <div>
                  <p className="text-slate-500 font-medium">Nama Pelanggan</p>
                  <p className="font-semibold">{notesInfo.customerName}</p>
                  {notesInfo.customerEmail && (
                    <p className="text-xs text-slate-400">{notesInfo.customerEmail}</p>
                  )}
                  {notesInfo.customerPhone && (
                    <p className="text-xs text-slate-400">{notesInfo.customerPhone}</p>
                  )}
                </div>
              )}
              <div>
                <p className="text-slate-500 font-medium">ID Pengguna</p>
                <p className="font-mono text-xs truncate">
                  {selected.userId}
                </p>
              </div>
            </div>
            {notesInfo?.specialRequest && (
              <div>
                <p className="text-slate-500 font-medium mb-1">Catatan / Permintaan Khusus</p>
                <p className="bg-slate-50 rounded-xl p-3 text-slate-700">
                  {notesInfo.specialRequest}
                </p>
              </div>
            )}
          </div>
          );
        })()}
      </Modal>
    </div>
  );
}
