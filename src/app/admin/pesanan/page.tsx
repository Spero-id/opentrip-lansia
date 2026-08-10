"use client";

import { useState, useEffect } from "react";
import { Eye, CheckCircle, Loader2, ExternalLink } from "lucide-react";
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

interface Payment {
  id: string;
  bookingId: string;
  method: string | null;
  amount: string;
  status: string;
  gatewayResponse: { proofUrl?: string } | null;
  paidAt: string | null;
}

interface BookingDetail extends Booking {
  payments: Payment[];
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
  awaiting_verification: {
    label: "Menunggu Verifikasi",
    className: "bg-orange-100 text-orange-800",
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
  const [detailData, setDetailData] = useState<BookingDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvingRowId, setApprovingRowId] = useState<string | null>(null);

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

  async function openDetail(item: Booking) {
    setSelected(item);
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const res = await fetch(`/api/bookings/${item.id}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setDetailData(data);
      }
    } catch {
      // silently fail, will show basic data from selected
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleApprove(bookingId: string, setRow?: boolean) {
    if (setRow) setApprovingRowId(bookingId);
    else setApproving(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "confirmed" }),
      });
      if (res.ok) {
        setRows(prev => prev.map(r => r.id === bookingId ? { ...r, status: "confirmed" } : r));
        if (selected?.id === bookingId) {
          setSelected(prev => prev ? { ...prev, status: "confirmed" } : prev);
          setDetailData(prev => prev ? { ...prev, status: "confirmed" } : prev);
        }
      }
    } catch {
      // silently fail
    } finally {
      if (setRow) setApprovingRowId(null);
      else setApproving(false);
    }
  }

  const displayData = detailData ?? selected;
  const payments = detailData?.payments ?? [];
  const proofPayments = payments.filter(p => p.gatewayResponse?.proofUrl);

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
                        <div className="flex items-center justify-end gap-1">
                          {(b.status === "pending" || b.status === "awaiting_verification") && (
                            <button
                              onClick={() => handleApprove(b.id, true)}
                              disabled={approvingRowId === b.id}
                              className="p-2 text-[#1CA6B7] hover:bg-[#1CA6B7]/10 rounded-xl transition disabled:opacity-50"
                              title="Approve"
                            >
                              {approvingRowId === b.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => openDetail(b)}
                            className="p-2 text-slate-500 hover:text-[#F49D1A] hover:bg-[#F49D1A]/10 rounded-xl transition"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
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
        onClose={() => { setDetailOpen(false); setSelected(null); setDetailData(null); }}
        title="Detail Pesanan"
        size="lg"
      >
        {displayData && (() => {
          const notesInfo = parseNotes(displayData.notes);
          return (
          <div className="space-y-4 text-sm">
            {detailLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
                Memuat detail...
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500 font-medium">Kode Booking</p>
                <p className="font-mono font-bold text-[#F49D1A] text-base">
                  {displayData.bookingCode}
                </p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Status</p>
                <p>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      statusBadge[displayData.status]?.className ??
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {statusBadge[displayData.status]?.label ?? displayData.status}
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
                  {displayData.totalParticipants} orang
                </p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Total Pembayaran</p>
                <p className="font-bold text-slate-900">
                  Rp{" "}
                  {Number(displayData.totalAmount).toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Tanggal Booking</p>
                <p>{formatDate(displayData.bookingDate)}</p>
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
                  {displayData.userId}
                </p>
              </div>
            </div>

            {/* Payment Proof Section */}
            {proofPayments.length > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-slate-500 font-medium mb-3">Bukti Pembayaran</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {proofPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-50"
                    >
                      <img
                        src={payment.gatewayResponse!.proofUrl!}
                        alt="Bukti pembayaran"
                        className="w-full h-48 object-contain"
                      />
                      <div className="p-2 flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          {payment.method ?? "Transfer"}
                        </span>
                        <a
                          href={payment.gatewayResponse!.proofUrl!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1CA6B7] hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Buka
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {notesInfo?.specialRequest && (
              <div>
                <p className="text-slate-500 font-medium mb-1">Catatan / Permintaan Khusus</p>
                <p className="bg-slate-50 rounded-xl p-3 text-slate-700">
                  {notesInfo.specialRequest}
                </p>
              </div>
            )}

            {/* Approve Button - Full Width at Bottom */}
            {(displayData.status === "pending" || displayData.status === "awaiting_verification") && (
              <div className="border-t border-slate-100 pt-4">
                <button
                  onClick={() => handleApprove(displayData.id)}
                  disabled={approving}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#1CA6B7] text-white text-sm font-bold rounded-xl hover:bg-[#1CA6B7]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {approving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {approving ? "Memproses..." : "Approve Pesanan"}
                </button>
              </div>
            )}
          </div>
          );
        })()}
      </Modal>
    </div>
  );
}
