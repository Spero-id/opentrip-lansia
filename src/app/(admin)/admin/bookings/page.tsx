"use client";

import { useState, useEffect } from "react";
import { Eye, CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";
import Modal from "@/app/(admin)/admin/components/modal";

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
  payments?: Payment[];
}

interface Payment {
  id: string;
  bookingId: string;
  method: string | null;
  amount: string;
  status: string;
  proofUrl?: string | null;
  adminNote?: string | null;
  gatewayResponse?: { proofUrl?: string } | null;
  paidAt: string | null;
}

interface BookingDetail extends Booking {
  payments: Payment[];
}

interface NotesInfo {
  destinationName?: string;
  destinationId?: number;
  travelDate?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  specialRequest?: string;
}

const statusBadge: Record<string, { label: string; className: string }> = {
  pending_payment: {
    label: "Belum Bayar",
    className: "bg-muted text-muted-foreground",
  },
  pending: {
    label: "Menunggu Verifikasi",
    className: "bg-warning-100 text-warning-800",
  },
  awaiting_verification: {
    label: "Menunggu Verifikasi",
    className: "bg-warning-100 text-warning-800",
  },
  confirmed: {
    label: "Dikonfirmasi",
    className: "bg-secondary/15 text-secondary-foreground",
  },
  cancelled: {
    label: "Dibatalkan",
    className: "bg-destructive-100 text-destructive-800",
  },
  completed: {
    label: "Selesai",
    className: "bg-info-100 text-info-800",
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

function getProofUrl(p: Payment | undefined): string | null {
  if (!p) return null;
  return p.proofUrl || p.gatewayResponse?.proofUrl || null;
}

function getPendingPayment(payments: Payment[] | undefined): Payment | undefined {
  return payments?.find(p => p.status === "pending");
}

function getPaymentMethod(payments: Payment[] | undefined): string {
  return payments?.find(p => p.method)?.method ?? "-";
}

function parseAdminMessage(notes: string | null): string {
  if (!notes) return "";
  try {
    const parsed = JSON.parse(notes);
    return typeof parsed?.adminMessage === "string" ? parsed.adminMessage : "";
  } catch {
    return "";
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
  const [rejecting, setRejecting] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectPaymentId, setRejectPaymentId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSending, setFeedbackSending] = useState(false);

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
    setRejectNote("");
    setRejectPaymentId(null);
    setFeedbackText("");
    try {
      const res = await fetch(`/api/bookings/${item.id}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setDetailData(data);
        setFeedbackText(parseAdminMessage(data.notes) || "");
      }
    } catch {
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleSendFeedback() {
    const target = selected?.id;
    if (!target) return;
    setFeedbackSending(true);
    try {
      const res = await fetch(`/api/bookings/${target}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ adminMessage: feedbackText }),
      });
      if (res.ok) {
        const detail = await fetch(`/api/bookings/${target}`, { credentials: "include" });
        if (detail.ok) setDetailData(await detail.json());
        setError(null);
      } else {
        const data = await res.json();
        setError(data?.error || "Gagal mengirim pesan.");
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setFeedbackSending(false);
    }
  }

  async function handleReview(paymentId: string, action: "approve" | "reject", note?: string) {
    if (action === "reject" && !note?.trim()) {
      setError("Alasan wajib diisi saat menolak pembayaran.");
      return;
    }
    const isRow = !detailOpen;
    if (isRow) setApprovingRowId(paymentId);
    else if (action === "approve") setApproving(true);
    else setRejecting(true);
    try {
      const res = await fetch(`/api/payments/${paymentId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action, note: note?.trim() || null }),
      });
      if (res.ok) {
        const target = selected?.id;
        const refresh = await fetch("/api/bookings", { credentials: "include" });
        if (refresh.ok) {
          const data = await refresh.json();
          setRows(Array.isArray(data) ? data : []);
        }
        if (target && detailOpen) {
          const detail = await fetch(`/api/bookings/${target}`, { credentials: "include" });
          if (detail.ok) setDetailData(await detail.json());
        }
        setRejectNote("");
        setRejectPaymentId(null);
      } else {
        const data = await res.json();
        setError(data?.error || "Gagal memproses pembayaran.");
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      if (isRow) setApprovingRowId(null);
      else if (action === "approve") setApproving(false);
      else setRejecting(false);
    }
  }

  const displayData = detailData ?? selected;
  const payments = detailData?.payments ?? [];
  const proofPayments = payments.filter(p => getProofUrl(p));
  const pendingPayment = getPendingPayment(displayData?.payments) ?? getPendingPayment(payments);
  const pendingRowPayment = getPendingPayment(selected?.payments);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive-50 border border-destructive-200 text-destructive-700 text-sm rounded-xl px-4 py-3">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-bold hover:underline">Tutup</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-6 rounded-3xl border border-border/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Manajemen Pesanan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Daftar seluruh pemesanan paket trip oleh pengguna.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted text-muted-foreground font-semibold border-b border-border/80">
              <tr>
                <th className="px-6 py-4">Kode Booking</th>
                <th className="px-6 py-4">Peserta</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Metode Pembayaran</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tanggal Booking</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    Memuat data...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    Belum ada data pesanan.
                  </td>
                </tr>
              ) : (
                rows.map((b) => {
                  const badge = statusBadge[b.status] ?? {
                    label: b.status,
                    className: "bg-muted text-muted-foreground",
                  };
                  const rowPayment = getPendingPayment(b.payments);
                  return (
                    <tr key={b.id} className="hover:bg-muted/60 transition">
                      <td className="px-6 py-4 font-mono font-bold text-primary-foreground">
                        {b.bookingCode}
                      </td>
                      <td className="px-6 py-4">
                        {b.totalParticipants} orang
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">
                        {b.currency === "IDR"
                          ? `Rp ${Number(b.totalAmount).toLocaleString("id-ID")}`
                          : b.totalAmount}
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {getPaymentMethod(b.payments)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(b.bookingDate)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {(b.status === "pending" || b.status === "awaiting_verification") && rowPayment && (
                            <>
                              <button
                                onClick={() => handleReview(rowPayment.id, "approve")}
                                disabled={approvingRowId === rowPayment.id}
                                className="p-2 text-secondary-foreground hover:bg-secondary/10 rounded-xl transition disabled:opacity-50"
                                title="Approve"
                              >
                                {approvingRowId === rowPayment.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setSelected(b);
                                  setDetailOpen(true);
                                  setDetailLoading(true);
                                  setDetailData(null);
                                  setRejectNote("");
                                  fetch(`/api/bookings/${b.id}`, { credentials: "include" })
                                    .then(r => r.ok ? r.json() : null)
                                    .then(d => { if (d) setDetailData(d); })
                                    .finally(() => setDetailLoading(false));
                                }}
                                className="p-2 text-destructive-500 hover:bg-destructive-500/10 rounded-xl transition"
                                title="Tolak"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => openDetail(b)}
                            className="p-2 text-muted-foreground hover:text-primary-foreground hover:bg-primary/10 rounded-xl transition"
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
        onClose={() => { setDetailOpen(false); setSelected(null); setDetailData(null); setRejectNote(""); setRejectPaymentId(null); }}
        title="Detail Pesanan"
        size="lg"
      >
        {displayData && (() => {
          const notesInfo = parseNotes(displayData.notes);
          const detailPendingPayment = pendingPayment ?? pendingRowPayment ?? getPendingPayment(payments);
          return (
          <div className="space-y-4 text-sm">
            {detailLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
                Memuat detail...
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground font-medium">Kode Booking</p>
                <p className="font-mono font-bold text-primary-foreground text-base">
                  {displayData.bookingCode}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Status</p>
                <p>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    statusBadge[displayData.status]?.className ?? "bg-muted text-muted-foreground"
                  }`}>
                    {statusBadge[displayData.status]?.label ?? displayData.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Metode Pembayaran</p>
                <p className="font-mono font-bold text-primary-foreground">
                  {getPaymentMethod(displayData.payments)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Destinasi</p>
                <p className="font-semibold">{notesInfo?.destinationName ?? "-"}</p>
                {notesInfo?.travelDate && (
                  <p className="text-xs text-muted-foreground mt-0.5">{notesInfo.travelDate}</p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Jumlah Peserta</p>
                <p className="font-semibold">{displayData.totalParticipants} orang</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Total Pembayaran</p>
                <p className="font-bold text-foreground">
                  Rp {Number(displayData.totalAmount).toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Tanggal Booking</p>
                <p>{formatDate(displayData.bookingDate)}</p>
              </div>
              {notesInfo?.customerName && (
                <div>
                  <p className="text-muted-foreground font-medium">Nama Pelanggan</p>
                  <p className="font-semibold">{notesInfo.customerName}</p>
                  {notesInfo.customerEmail && <p className="text-xs text-muted-foreground">{notesInfo.customerEmail}</p>}
                  {notesInfo.customerPhone && <p className="text-xs text-muted-foreground">{notesInfo.customerPhone}</p>}
                </div>
              )}
              <div>
                <p className="text-muted-foreground font-medium">ID Pengguna</p>
                <p className="font-mono text-xs truncate">{displayData.userId}</p>
              </div>
            </div>

            {proofPayments.length > 0 && (
              <div className="border-t border-border pt-4">
                <p className="text-muted-foreground font-medium mb-3">Bukti Pembayaran</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {proofPayments.map((payment) => {
                    const proof = getProofUrl(payment);
                    return (
                      <div key={payment.id} className="relative group rounded-xl border border-border overflow-hidden bg-muted">
                        <img
                          src={proof!}
                          alt="Bukti pembayaran"
                          className="w-full h-48 object-contain"
                        />
                        <div className="p-2 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{payment.method ?? "Transfer"}</span>
                          <a
                            href={proof!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-secondary-foreground hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Buka
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {detailPendingPayment?.adminNote && (
              <div>
                <p className="text-muted-foreground font-medium mb-1">Catatan Admin</p>
                <p className="bg-warning-50 rounded-xl p-3 text-foreground">
                  {detailPendingPayment.adminNote}
                </p>
              </div>
            )}

            {notesInfo?.specialRequest && (
              <div>
                <p className="text-muted-foreground font-medium mb-1">Catatan / Permintaan Khusus</p>
                <p className="bg-muted rounded-xl p-3 text-foreground">
                  {notesInfo.specialRequest}
                </p>
              </div>
            )}

            <div className="border-t border-border pt-4">
              <p className="text-muted-foreground font-medium mb-1">
                Feedback / Pesan ke Pengguna
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                Pesan ini akan tampil di halaman &quot;Perjalanan Saya&quot; milik pengguna.
              </p>
              {parseAdminMessage(displayData.notes) && (
                <p className="bg-info-50 border border-info-100 rounded-xl p-3 text-foreground mb-2">
                  {parseAdminMessage(displayData.notes)}
                </p>
              )}
              <div className="space-y-2">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tulis pesan/feedback untuk pengguna..."
                  rows={3}
                  className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  onClick={handleSendFeedback}
                  disabled={feedbackSending || !feedbackText.trim()}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {feedbackSending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {feedbackSending ? "Mengirim..." : "Kirim Pesan"}
                </button>
              </div>
            </div>

            {(displayData.status === "pending" || displayData.status === "awaiting_verification") && detailPendingPayment && (
              <div className="border-t border-border pt-4 space-y-3">
                {rejectPaymentId === detailPendingPayment.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder="Alasan penolakan (wajib)..."
                      rows={3}
                      className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-destructive-400"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(detailPendingPayment.id, "reject", rejectNote)}
                        disabled={rejecting}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-destructive-600 text-white text-sm font-bold rounded-xl hover:bg-destructive-700 transition disabled:opacity-50"
                      >
                        {rejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        {rejecting ? "Memproses..." : "Konfirmasi Tolak"}
                      </button>
                      <button
                        onClick={() => setRejectPaymentId(null)}
                        className="px-5 py-3 bg-muted text-muted-foreground text-sm font-bold rounded-xl hover:bg-border transition"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleReview(detailPendingPayment.id, "approve")}
                      disabled={approving}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-secondary text-secondary-foreground text-sm font-bold rounded-xl hover:bg-secondary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      {approving ? "Memproses..." : "Approve Pembayaran"}
                    </button>
                    <button
                      onClick={() => { setRejectPaymentId(detailPendingPayment.id); setRejectNote(""); }}
                      disabled={approving}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-destructive-50 text-destructive-600 text-sm font-bold rounded-xl hover:bg-destructive-100 transition disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Tolak Pembayaran
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          );
        })()}
      </Modal>
    </div>
  );
}
