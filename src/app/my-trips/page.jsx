"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Luggage } from "lucide-react";

// ─── Warna brand project ───────────────────────────────────────────────────
const A = "#F49D1A";

// ─── Label & warna status Private Trip ──────────────────────────────────
const STATUS_LABEL = {
  draft: "Draft",
  submitted: "Menunggu Review",
  reviewed: "Sedang Direview",
  approved: "Disetujui",
  rejected: "Ditolak",
  revision: "Perlu Revisi",
};

const STATUS_COLOR = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-blue-100 text-blue-700",
  reviewed: "bg-indigo-100 text-indigo-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  revision: "bg-amber-100 text-amber-700",
};

const PROPOSAL_LABEL = {
  pending: "Menunggu",
  accepted: "Diterima",
  rejected: "Ditolak",
  revised: "Revisi",
};

const PROPOSAL_COLOR = {
  pending: "bg-blue-100 text-blue-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  revised: "bg-amber-100 text-amber-700",
};

// ─── Label & warna status Open Trip ─────────────────────────────────────
const OPEN_TRIP_STATUS_LABEL = {
  pending_payment: "Menunggu Pembayaran",
  confirmed: "Terkonfirmasi",
  pending: "Menunggu Verifikasi",
  awaiting_verification: "Menunggu Verifikasi",
  cancelled: "Dibatalkan",
  completed: "Selesai",
};

const OPEN_TRIP_STATUS_COLOR = {
  pending_payment: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  pending: "bg-blue-100 text-blue-700",
  awaiting_verification: "bg-orange-100 text-orange-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-gray-100 text-gray-600",
};

const PAYMENT_STATUS_LABEL = {
  pending: "Menunggu Verifikasi",
  paid: "Lunas",
  rejected: "Ditolak",
  awaiting_verification: "Menunggu Verifikasi",
  pending_payment: "Menunggu Pembayaran",
};

const PAYMENT_STATUS_COLOR = {
  pending: "text-blue-700",
  paid: "text-emerald-700",
  rejected: "text-red-700",
  awaiting_verification: "text-orange-700",
  pending_payment: "text-amber-700",
};

// ─── Helpers ──────────────────────────────────────────────────────────────
function formatRupiah(val) {
  if (!val && val !== 0) return null;
  const num = typeof val === "string" ? parseInt(val.replace(/\D/g, ""), 10) : val;
  if (isNaN(num)) return null;
  return "Rp " + num.toLocaleString("id-ID");
}

function parseDestinationPreferences(text) {
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
    return text.split(",").map((s) => s.trim()).filter(Boolean);
  } catch {
    return text.split(",").map((s) => s.trim()).filter(Boolean);
  }
}

// ─── Ikon ─────────────────────────────────────────────────────────────────
const icons = {
  copy: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  copied: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  chevron: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  refresh: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  send: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  eye: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  x: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  message: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

// ─── ProposalCard (Private Trip) ──────────────────────────────────────────
function ProposalCard({ proposal, requestId, requestStatus, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  const handleAction = async (action) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/private-trips/${requestId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: proposal.id, action, revisionNote: note }),
      });
      if (res.ok) onRefresh?.();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (requestStatus !== "revision" && proposal.status !== "pending") return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Proposal</p>
          <p className="text-xs font-bold text-gray-800 mt-1">Estimasi Harga: {formatRupiah(proposal.estimatedPrice)}</p>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${PROPOSAL_COLOR[proposal.status] || "bg-gray-100 text-gray-600"}`}>
          {PROPOSAL_LABEL[proposal.status] || proposal.status}
        </span>
      </div>
      {proposal.proposalContent && (
        <p className="text-xs text-gray-600 leading-relaxed">{proposal.proposalContent}</p>
      )}
      {proposal.inclusions && (
        <div className="text-xs"><span className="font-semibold text-gray-700">Termasuk:</span> <span className="text-gray-500">{proposal.inclusions}</span></div>
      )}
      {proposal.exclusions && (
        <div className="text-xs"><span className="font-semibold text-gray-700">Tidak Termasuk:</span> <span className="text-gray-500">{proposal.exclusions}</span></div>
      )}
      {proposal.status === "pending" && (
        <div className="flex gap-2 pt-1">
          <button onClick={() => handleAction("accept")} disabled={loading} className="flex-1 bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-40 transition">Terima</button>
          <button onClick={() => handleAction("reject")} disabled={loading} className="flex-1 bg-red-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-red-600 disabled:opacity-40 transition">Tolak</button>
          <button onClick={() => handleAction("revise")} disabled={loading} className="flex-1 bg-amber-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-amber-600 disabled:opacity-40 transition">Revisi</button>
        </div>
      )}
      {requestStatus === "revision" && proposal.status === "pending" && (
        <div className="pt-1 space-y-2">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan revisi..." rows={2} className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#F49D1A]/30 resize-none" />
          <button onClick={() => handleAction("propose")} disabled={loading || !note.trim()} className="w-full bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-indigo-600 disabled:opacity-40 transition">Kirim Revisi</button>
        </div>
      )}
    </div>
  );
}

// ─── ParsedPreferences ─────────────────────────────────────────────────────
function ParsedPreferences({ text }) {
  const items = parseDestinationPreferences(text);
  if (items.length === 0) return <span className="text-gray-400">-</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className="text-xs bg-orange-50 text-[#F49D1A] border border-[#F49D1A]/20 rounded-full px-2.5 py-0.5 font-medium">{item}</span>
      ))}
    </div>
  );
}

// ─── Kartu Request (Private Trip) ─────────────────────────────────────────
function RequestCard({ req, onRefresh }) {
  const [open, setOpen] = useState(false);

  const destinations = parseDestinationPreferences(req.destinationPreferences);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
      <div
        role="button"
        tabIndex={0}
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-gray-50/70 transition cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((v) => !v); } }}
      >
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Private Trip
            </span>
            <p className="text-sm font-bold text-gray-900 truncate">{req.title}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span>{req.durationDays} Hari</span>
            <span>·</span>
            <span>{req.participantsCount} Peserta</span>
            {req.budgetEstimate && (<><span>·</span><span>{formatRupiah(req.budgetEstimate)}</span></>)}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLOR[req.status] || "bg-gray-100 text-gray-600"}`}>
            {STATUS_LABEL[req.status] || req.status}
          </span>
          <span className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            {icons.chevron}
          </span>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4 bg-gray-50/30">
          {/* Destinasi */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Destinasi yang Diinginkan</p>
            <ParsedPreferences text={req.destinationPreferences} />
          </div>

          {/* Kebutuhan Khusus */}
          {req.specialRequirements && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-1.5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Kebutuhan Khusus</p>
              <p className="text-xs text-gray-600 leading-relaxed">{req.specialRequirements}</p>
            </div>
          )}

          {/* Status & Aksi */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">Dibuat: {new Date(req.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>

          {/* Proposals */}
          {req.proposals && req.proposals.length > 0 && (
            <div className="space-y-3">
              {req.proposals.map((p) => (
                <ProposalCard key={p.id} proposal={p} requestId={req.id} requestStatus={req.status} onRefresh={onRefresh} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Kartu Open Trip Booking ──────────────────────────────────────────────
function OpenTripBookingCard({ booking }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  let notesObj = {};
  if (booking.notes) {
    try {
      notesObj = typeof booking.notes === "string" ? JSON.parse(booking.notes) : booking.notes;
    } catch {
      notesObj = { raw: booking.notes };
    }
  }

  const destinationName = notesObj.destinationName || "Paket Open Trip";
  const travelDate = notesObj.travelDate || null;
  const customerName = notesObj.customerName || null;
  const customerEmail = notesObj.customerEmail || null;
  const customerPhone = notesObj.customerPhone || null;
  const specialRequest = notesObj.specialRequest || null;

  const copyCode = (e) => {
    e.stopPropagation();
    if (booking.bookingCode) {
      navigator.clipboard.writeText(booking.bookingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const paymentStatus = booking.payments?.[0]?.status || booking.status || "confirmed";
  const paymentMethod = booking.payments?.[0]?.method || "online";
  const paymentProof = booking.payments?.[0]?.proofUrl || booking.payments?.[0]?.gatewayResponse?.proofUrl || null;
  const paymentAdminNote = booking.payments?.[0]?.adminNote || null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
      <div
        id={`open-trip-card-${booking.id}`}
        role="button"
        tabIndex={0}
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-gray-50/70 transition cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((v) => !v); } }}
      >
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-[#F49D1A] border border-[#F49D1A]/30">
              Open Trip
            </span>
            <p className="text-sm font-bold text-gray-900 truncate">{destinationName}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 font-mono text-gray-700 bg-gray-100 rounded px-2 py-0.5">
              {booking.bookingCode}
              <button
                onClick={copyCode}
                title="Salin Kode Booking"
                className="hover:text-gray-900 transition p-0.5"
              >
                {copied ? icons.copied : icons.copy}
              </button>
            </span>

            {travelDate && (
              <>
                <span>·</span>
                <span>Tgl Perjalanan: <strong className="text-gray-700">{travelDate}</strong></span>
              </>
            )}

            <span>·</span>
            <span>{booking.totalParticipants} Peserta</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
          <div className="text-right">
            <p className="text-sm font-extrabold text-gray-900" style={{ color: A }}>
              {formatRupiah(booking.totalAmount) || "IDR " + booking.totalAmount}
            </p>
            <span
              className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                OPEN_TRIP_STATUS_COLOR[booking.status] || "bg-teal-100 text-teal-800"
              }`}
            >
              {OPEN_TRIP_STATUS_LABEL[booking.status] || booking.status}
            </span>
          </div>
          {booking.status === "pending_payment" && (
            <a
              href={`/checkout/pay/${booking.id}`}
              className="px-4 py-2 bg-[#F49D1A] text-white text-xs font-bold rounded-lg hover:bg-[#c47d12] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Bayar
            </a>
          )}
          <span className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            {icons.chevron}
          </span>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4 bg-gray-50/30">
          {/* Ringkasan Biaya */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Rincian Pembayaran
            </p>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Subtotal ({booking.totalParticipants} pax)</span>
              <span>{formatRupiah(booking.subtotal) || booking.subtotal}</span>
            </div>
            {Number(booking.discountAmount) > 0 && (
              <div className="flex justify-between text-xs text-teal-600 font-medium">
                <span>Diskon Voucher</span>
                <span>-{formatRupiah(booking.discountAmount)}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-2 flex justify-between text-sm font-bold text-gray-900">
              <span>Total Pembayaran</span>
              <span style={{ color: A }}>{formatRupiah(booking.totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between pt-1 text-[11px] text-gray-500">
              <span>Metode: <strong className="uppercase">{paymentMethod}</strong></span>
              <span>Status Pembayaran: <strong className={`capitalize ${PAYMENT_STATUS_COLOR[paymentStatus] || "text-gray-700"}`}>{PAYMENT_STATUS_LABEL[paymentStatus] || paymentStatus}</strong></span>
            </div>
          </div>

          {/* Bukti Pembayaran */}
          {paymentProof && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Bukti Pembayaran
              </p>
              <a href={paymentProof} target="_blank" rel="noopener noreferrer" className="block">
                <img
                  src={paymentProof}
                  alt="Bukti pembayaran"
                  className="w-full max-h-64 object-contain bg-gray-50 rounded-lg border border-gray-200"
                />
              </a>
            </div>
          )}

          {paymentAdminNote && (
            <div className="bg-white rounded-xl border border-amber-100 p-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Catatan Admin
              </p>
              <p className="text-xs text-amber-800 bg-amber-50 rounded-lg px-3 py-2">
                {paymentAdminNote}
              </p>
            </div>
          )}

          {/* Pemesan Utama */}
          {(customerName || customerEmail || customerPhone) && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-1.5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Kontak Pemesan
              </p>
              {customerName && (
                <div className="flex text-xs">
                  <span className="w-28 text-gray-400 shrink-0">Nama Pemesan</span>
                  <span className="font-semibold text-gray-800">{customerName}</span>
                </div>
              )}
              {customerPhone && (
                <div className="flex text-xs">
                  <span className="w-28 text-gray-400 shrink-0">No. WhatsApp</span>
                  <span className="text-gray-700">{customerPhone}</span>
                </div>
              )}
              {customerEmail && (
                <div className="flex text-xs">
                  <span className="w-28 text-gray-400 shrink-0">Email</span>
                  <span className="text-gray-700">{customerEmail}</span>
                </div>
              )}
              {specialRequest && (
                <div className="flex text-xs pt-1">
                  <span className="w-28 text-gray-400 shrink-0">Catatan</span>
                  <span className="text-amber-800 font-medium bg-amber-50 rounded px-2 py-0.5">{specialRequest}</span>
                </div>
              )}
            </div>
          )}

          {/* Daftar Peserta */}
          {booking.participants && booking.participants.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                Daftar Peserta ({booking.participants.length} Orang)
              </p>
              <div className="space-y-2">
                {booking.participants.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="flex items-center justify-between text-xs bg-gray-50 rounded-lg p-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-100 text-[#F49D1A] font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-gray-800">{p.fullName}</span>
                      {p.isPrimary && (
                        <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                          Pemesan Utama
                        </span>
                      )}
                    </div>
                    <span className="text-gray-500">{p.phone || "-"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Halaman utama Booking History ─────────────────────────────────────────
export default function MyTripsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [tab, setTab] = useState("open");
  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.push("/login?redirect=/my-trips");
      return;
    }
    fetchData();
  }, [session, isPending]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, requestsRes] = await Promise.all([
        fetch("/api/bookings").then((r) => r.json()),
        fetch("/api/private-trips").then((r) => r.json()),
      ]);
      setBookings(Array.isArray(bookingsRes) ? bookingsRes : bookingsRes?.rows || []);
      setRequests(Array.isArray(requestsRes) ? requestsRes : requestsRes?.rows || []);
    } catch (err) {
      console.error("Gagal memuat data:", err);
    }
    setLoading(false);
  };

  if (isPending || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#F49D1A]/30 border-t-[#F49D1A] rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-400">Memuat data perjalanan...</p>
          </div>
        </main>
      </div>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    if (filter === "all") return true;
    return b.status === filter;
  });

  const filteredRequests = requests.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <Navbar />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Perjalanan Saya</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola booking open trip dan private trip Anda</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          <button
            onClick={() => { setTab("open"); setFilter("all"); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === "open" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Open Trip ({bookings.length})
          </button>
          <button
            onClick={() => { setTab("private"); setFilter("all"); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === "private" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Private Trip ({requests.length})
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 flex-wrap mb-6">
          {[
            { value: "all", label: "Semua" },
            ...(tab === "open"
              ? [
                  { value: "pending_payment", label: "Menunggu Bayar" },
                  { value: "confirmed", label: "Terkonfirmasi" },
                  { value: "completed", label: "Selesai" },
                ]
              : [
                  { value: "submitted", label: "Menunggu Review" },
                  { value: "approved", label: "Disetujui" },
                  { value: "revision", label: "Perlu Revisi" },
                ]),
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                filter === f.value
                  ? "bg-[#F49D1A] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[#F49D1A]/50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "open" ? (
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <EmptyState type="open" />
            ) : (
              filteredBookings.map((b) => <OpenTripBookingCard key={b.id} booking={b} />)
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <EmptyState type="private" />
            ) : (
              filteredRequests.map((r) => <RequestCard key={r.id} req={r} onRefresh={fetchData} />)
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function EmptyState({ type }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Luggage className="w-8 h-8 text-gray-300" />
      </div>
      <p className="text-sm font-semibold text-gray-500 mb-1">
        {type === "open" ? "Belum ada booking open trip" : "Belum ada request private trip"}
      </p>
      <p className="text-xs text-gray-400 mb-4">
        {type === "open"
          ? "Mulai jelajahi destinasi dan buat booking pertama Anda"
          : "Ajukan request private trip untuk rombongan Anda"}
      </p>
      <Link
        href={type === "open" ? "/trips" : "/private"}
        className="px-4 py-2 bg-[#F49D1A] text-white text-xs font-bold rounded-lg hover:bg-[#c47d12] transition"
      >
        {type === "open" ? "Lihat Destinasi" : "Buat Request"}
      </Link>
    </div>
  );
}
