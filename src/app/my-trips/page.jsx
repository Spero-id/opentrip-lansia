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
  submitted: "Menunggu Tinjauan",
  reviewed: "Sedang Ditinjau",
  revision: "Revisi",
  approved: "Disetujui",
  rejected: "Ditolak",
};
const STATUS_COLOR = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-amber-100 text-amber-800",
  reviewed: "bg-blue-100 text-blue-700",
  revision: "bg-purple-100 text-purple-700",
  approved: "bg-teal-100 text-teal-700",
  rejected: "bg-red-100 text-red-700",
};
const PROPOSAL_LABEL = {
  pending: "Menunggu Respons",
  accepted: "Diterima",
  rejected: "Ditolak",
  revised: "Diminta Revisi",
};
const PROPOSAL_COLOR = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-teal-100 text-teal-700",
  rejected: "bg-red-100 text-red-700",
  revised: "bg-purple-100 text-purple-700",
};

// ─── Label & warna status Open Trip ─────────────────────────────────────
const OPEN_TRIP_STATUS_LABEL = {
  confirmed: "Terkonfirmasi",
  pending: "Menunggu Pembayaran",
  paid: "Lunas",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};
const OPEN_TRIP_STATUS_COLOR = {
  confirmed: "bg-teal-100 text-teal-800 border border-teal-200",
  pending: "bg-amber-100 text-amber-800 border border-amber-200",
  paid: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  completed: "bg-blue-100 text-blue-800 border border-blue-200",
  cancelled: "bg-red-100 text-red-800 border border-red-200",
};

// ─── Helpers ──────────────────────────────────────────────────────────────
function formatRupiah(val) {
  if (val === undefined || val === null || val === "" || val === "0") return null;
  const num = Number(val);
  if (isNaN(num)) return null;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function parseDestinationPreferences(text) {
  if (!text) return [];
  const sections = [];
  let currentSection = null;

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    const headerMatch = line.match(/^\[(.+)\]$/);
    if (headerMatch) {
      if (currentSection) sections.push(currentSection);
      currentSection = { heading: headerMatch[1], rows: [] };
    } else if (currentSection) {
      const colonIdx = line.indexOf(": ");
      if (colonIdx > 0) {
        const key = line.slice(0, colonIdx).trim();
        const val = line.slice(colonIdx + 2).trim();
        currentSection.rows.push({ type: "kv", key, val });
      } else {
        const parts = line.split("|").map((s) => s.trim());
        currentSection.rows.push({ type: "participant", parts });
      }
    }
  }
  if (currentSection) sections.push(currentSection);
  return sections;
}

// ─── Ikon ─────────────────────────────────────────────────────────────────
const icons = {
  chevron: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  revise: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  ),
  reject: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  copied: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-teal-600">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

// ─── ProposalCard (Private Trip) ──────────────────────────────────────────
function ProposalCard({ proposal, requestId, requestStatus, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [reviseOpen, setReviseOpen] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");

  const isActionable =
    (proposal.status === "pending" || proposal.status === "revised") &&
    requestStatus === "reviewed";

  async function handleAction(action, note) {
    setLoading(true);
    setMsg(null);
    try {
      const body = { proposalId: proposal.id, action };
      if (action === "revise" && note?.trim()) body.revisionNote = note.trim();
      const res = await fetch(`/api/private-trips/${requestId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "err", text: data.error || "Terjadi kesalahan" });
      } else {
        setMsg({
          type: "ok",
          text:
            action === "accept"
              ? "Proposal berhasil diterima! Admin akan menghubungi Anda."
              : action === "revise"
              ? "Permintaan revisi berhasil dikirim ke admin."
              : "Proposal telah ditolak.",
        });
        setReviseOpen(false);
        setRevisionNote("");
        onRefresh();
      }
    } catch {
      setMsg({ type: "err", text: "Tidak dapat terhubung ke server." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
            PROPOSAL_COLOR[proposal.status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {PROPOSAL_LABEL[proposal.status] || proposal.status}
        </span>
        <span className="text-[11px] text-gray-400">
          {new Date(proposal.createdAt).toLocaleString("id-ID", {
            day: "numeric", month: "long", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          })}
        </span>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          Detail Penawaran
        </p>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl p-3.5">
          {proposal.proposalContent}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-100 p-3.5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1">Estimasi Harga</p>
          {formatRupiah(proposal.estimatedPrice) ? (
            <p className="text-base font-bold" style={{ color: A }}>
              {formatRupiah(proposal.estimatedPrice)}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">Belum dicantumkan</p>
          )}
        </div>
        <div className="rounded-xl border border-gray-100 p-3.5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1">Sudah Termasuk</p>
          <p className="text-sm text-gray-700">{proposal.inclusions || <span className="text-gray-400 italic">—</span>}</p>
        </div>
        <div className="rounded-xl border border-gray-100 p-3.5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1">Tidak Termasuk</p>
          <p className="text-sm text-gray-700">{proposal.exclusions || <span className="text-gray-400 italic">—</span>}</p>
        </div>
      </div>

      {msg && (
        <p
          className={`text-xs font-semibold px-3 py-2.5 rounded-xl border ${
            msg.type === "ok"
              ? "bg-teal-50 text-teal-700 border-teal-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {msg.text}
        </p>
      )}

      {isActionable && (
        <div className="space-y-3 pt-1">
          {/* Inline revisi form */}
          {reviseOpen && (
            <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 space-y-3">
              <p className="text-xs font-bold text-purple-700">Apa yang ingin kamu minta revisi?</p>
              <textarea
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Contoh: Tolong ganti hotel ke bintang 4, dan tambahkan kunjungan ke Tanah Lot..."
                className="w-full rounded-xl border border-purple-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 resize-none transition"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-gray-400">{revisionNote.length}/1000</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setReviseOpen(false); setRevisionNote(""); }}
                    disabled={loading}
                    className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction("revise", revisionNote)}
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white px-4 py-1.5 text-xs font-bold transition disabled:opacity-50"
                  >
                    {icons.revise} Kirim Permintaan Revisi
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              id={`btn-accept-${proposal.id}`}
              onClick={() => handleAction("accept")}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white px-4 py-2 text-xs font-bold transition disabled:opacity-50"
            >
              {icons.check} Terima Proposal
            </button>
            <button
              id={`btn-revise-${proposal.id}`}
              onClick={() => setReviseOpen((v) => !v)}
              disabled={loading}
              className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold transition disabled:opacity-50 active:scale-95 ${
                reviseOpen
                  ? "border-purple-400 bg-purple-100 text-purple-700"
                  : "border-purple-300 text-purple-700 hover:bg-purple-50"
              }`}
            >
              {icons.revise} Minta Revisi
            </button>
            <button
              id={`btn-reject-${proposal.id}`}
              onClick={() => handleAction("reject")}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 active:scale-95 px-4 py-2 text-xs font-bold transition disabled:opacity-50"
            >
              {icons.reject} Tolak
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ParsedPreferences({ text }) {
  const sections = parseDestinationPreferences(text);
  if (sections.length === 0) return null;

  return (
    <div className="space-y-3">
      {sections.map((sec, si) => {
        if (sec.heading.startsWith("Asal Pemesanan")) {
          const tipeRow = sec.rows.find((r) => r.type === "kv" && r.key === "Tipe");
          const institusiRow = sec.rows.find((r) => r.type === "kv" && r.key === "Institusi");
          const tipe = tipeRow?.val || "Individu";
          const isIndividu = tipe === "Individu" && !institusiRow;

          return (
            <div key={si} className="rounded-xl border border-gray-100 overflow-hidden">
              <div
                className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: `${A}12`, color: "#8a5c00" }}
              >
                {sec.heading}
              </div>
              <div className="px-4 py-3">
                {isIndividu ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full px-3 py-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    Individu
                  </span>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
                      <span className="text-[11px] font-semibold text-gray-400 sm:w-36 shrink-0">Tipe</span>
                      <span className="text-sm text-gray-800 font-medium">{tipe}</span>
                    </div>
                    {institusiRow && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
                        <span className="text-[11px] font-semibold text-gray-400 sm:w-36 shrink-0">Institusi</span>
                        <span className="text-sm text-gray-800 font-semibold">{institusiRow.val}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        }

        return (
          <div key={si} className="rounded-xl border border-gray-100 overflow-hidden">
            <div
              className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: `${A}12`, color: "#8a5c00" }}
            >
              {sec.heading}
            </div>
            <div className="px-4 py-3 space-y-2">
              {sec.rows.map((row, ri) => {
                if (row.type === "kv") {
                  return (
                    <div key={ri} className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
                      <span className="text-[11px] font-semibold text-gray-400 sm:w-36 shrink-0">
                        {row.key}
                      </span>
                      <span className="text-sm text-gray-800 font-medium">{row.val}</span>
                    </div>
                  );
                }
                return (
                  <div key={ri} className="bg-gray-50 rounded-lg px-3 py-2 flex flex-wrap gap-x-3 gap-y-1">
                    {row.parts.map((part, pi) => (
                      <span
                        key={pi}
                        className={`text-xs ${pi === 0 ? "font-semibold text-gray-800 w-full" : "text-gray-500"}`}
                      >
                        {part}
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Kartu Request (Private Trip) ─────────────────────────────────────────
function RequestCard({ req, onRefresh }) {
  const [open, setOpen] = useState(false);
  const pendingProposals = req.proposals?.filter(
    (p) => p.status === "pending" || p.status === "revised"
  ).length ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
      <button
        id={`trip-card-${req.id}`}
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-gray-50/70 transition"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
              Private Trip
            </span>
            <p className="text-sm font-bold text-gray-900 truncate">{req.title}</p>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            <span className="text-xs text-gray-500">{req.durationDays} hari</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500">{req.participantsCount} peserta</span>
            {req.submittedAt && (
              <>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500">
                  Diajukan: {new Date(req.submittedAt).toLocaleDateString("id-ID", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {pendingProposals > 0 && (
            <span
              className="text-[10px] font-bold rounded-full px-2 py-0.5 animate-pulse"
              style={{ backgroundColor: `${A}20`, color: "#8a5c00" }}
            >
              {pendingProposals} proposal baru
            </span>
          )}
          {req.proposals?.length > 0 && pendingProposals === 0 && (
            <span className="text-[10px] font-semibold text-gray-400 rounded-full px-2 py-0.5 bg-gray-100">
              {req.proposals.length} proposal
            </span>
          )}
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
              STATUS_COLOR[req.status] || "bg-gray-100 text-gray-600"
            }`}
          >
            {STATUS_LABEL[req.status] || req.status}
          </span>
          <span className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            {icons.chevron}
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-5 bg-gray-50/30">
          {formatRupiah(req.budgetEstimate) && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Estimasi Budget
              </p>
              <p className="text-base font-bold" style={{ color: A }}>
                {formatRupiah(req.budgetEstimate)}
              </p>
            </div>
          )}

          {req.destinationPreferences && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Detail Permintaan
              </p>
              <ParsedPreferences text={req.destinationPreferences} />
            </div>
          )}

          {req.specialRequirements && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Kebutuhan Khusus
              </p>
              <p className="text-sm text-gray-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 leading-relaxed">
                {req.specialRequirements}
              </p>
            </div>
          )}

          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Proposal dari Admin
            </p>
            {!req.proposals || req.proposals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center bg-white">
                <p className="text-sm text-gray-400">Belum ada proposal.</p>
                <p className="text-xs text-gray-300 mt-1">Tim kami sedang menyiapkan penawaran terbaik untuk Anda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {req.proposals.map((p) => (
                  <ProposalCard
                    key={p.id}
                    proposal={p}
                    requestId={req.id}
                    requestStatus={req.status}
                    onRefresh={onRefresh}
                  />
                ))}
              </div>
            )}
          </div>
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
              <span>Status Pembayaran: <strong className="capitalize text-teal-700">{paymentStatus}</strong></span>
            </div>
          </div>

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

  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'open' | 'private'
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [privateRequests, setPrivateRequests] = useState([]);
  const [openBookings, setOpenBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
      return;
    }
    if (!isPending && !session?.user) return;

    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [resPrivate, resOpen] = await Promise.all([
          fetch("/api/private-trips").catch(() => null),
          fetch("/api/bookings").catch(() => null),
        ]);

        let privateData = [];
        if (resPrivate && resPrivate.ok) {
          const list = await resPrivate.json();
          privateData = await Promise.all(
            list.map(async (req) => {
              try {
                const r = await fetch(`/api/private-trips/${req.id}`);
                if (!r.ok) return { ...req, proposals: [] };
                const d = await r.json();
                return { ...req, proposals: d.proposals || [] };
              } catch {
                return { ...req, proposals: [] };
              }
            })
          );
        }

        let openData = [];
        if (resOpen && resOpen.ok) {
          openData = await resOpen.json();
        }

        if (!cancelled) {
          setPrivateRequests(Array.isArray(privateData) ? privateData : []);
          setOpenBookings(Array.isArray(openData) ? openData : []);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Terjadi kesalahan saat memuat data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [isPending, session, router, refreshKey]);

  if (isPending || (!session?.user && !error)) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-[#F49D1A]/20 border-t-[#F49D1A] animate-spin" />
            <p className="text-gray-400 text-sm">Memuat Riwayat Pemesanan...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Filter items
  const filteredOpenBookings = openBookings.filter((b) => {
    let notesObj = {};
    try {
      notesObj = typeof b.notes === "string" ? JSON.parse(b.notes) : b.notes || {};
    } catch {
      notesObj = {};
    }
    const title = notesObj.destinationName || "Open Trip";
    const matchSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredPrivateRequests = privateRequests.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.destinationPreferences || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalOpen = openBookings.length;
  const totalPrivate = privateRequests.length;
  const totalAll = totalOpen + totalPrivate;

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 min-h-screen bg-white pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
            <p className="font-semibold text-xs tracking-wider uppercase mb-1" style={{ color: A }}>
              PESANAN SAYA
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Riwayat <span style={{ color: A }}>Pemesanan</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1 max-w-xl">
              Lihat status pengajuan Private Trip dan rincian pemesanan Open Trip Anda dalam satu tempat.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Controls: Tabs & Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-2xl w-fit">
              <button
                id="tab-all"
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === "all"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Semua
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === "all" ? "bg-orange-100 text-[#F49D1A]" : "bg-gray-200 text-gray-600"}`}>
                  {totalAll}
                </span>
              </button>

              <button
                id="tab-open-trip"
                onClick={() => setActiveTab("open")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === "open"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Open Trip
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === "open" ? "bg-orange-100 text-[#F49D1A]" : "bg-gray-200 text-gray-600"}`}>
                  {totalOpen}
                </span>
              </button>

              <button
                id="tab-private-trip"
                onClick={() => setActiveTab("private")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === "private"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Private Trip
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === "private" ? "bg-orange-100 text-[#F49D1A]" : "bg-gray-200 text-gray-600"}`}>
                  {totalPrivate}
                </span>
              </button>
            </div>

            {/* Quick CTAs */}
            <div className="flex items-center gap-2">
              <Link
                id="btn-browse-destinations"
                href="/trips"
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 text-xs font-bold transition"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Cari Open Trip
              </Link>

              <Link
                id="btn-new-private-trip"
                href="/private"
                className="inline-flex items-center gap-1.5 rounded-xl text-white px-4 py-2 text-xs font-bold transition active:scale-95 shadow-sm"
                style={{ backgroundColor: A }}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Ajukan Private Trip
              </Link>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                id="input-search-booking"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari trip, destinasi, atau kode booking..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#F49D1A] focus:border-transparent"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            <select
              id="select-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#F49D1A] font-medium text-gray-700"
            >
              <option value="all">Semua Status</option>
              <option value="confirmed">Terkonfirmasi</option>
              <option value="pending">Menunggu</option>
              <option value="reviewed">Sedang Ditinjau</option>
              <option value="approved">Disetujui</option>
              <option value="cancelled">Dibatalkan</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>

          {/* Content Listing */}
          {loading ? (
            <div className="space-y-3 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-6 text-center">
              <p className="text-sm text-red-700 font-semibold">{error}</p>
              <button onClick={triggerRefresh} className="mt-3 text-xs font-bold text-red-600 underline">
                Coba lagi
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {/* Render Open Trip items */}
              {(activeTab === "all" || activeTab === "open") &&
                filteredOpenBookings.map((b) => (
                  <OpenTripBookingCard key={`open-${b.id}`} booking={b} />
                ))}

              {/* Render Private Trip items */}
              {(activeTab === "all" || activeTab === "private") &&
                filteredPrivateRequests.map((req) => (
                  <RequestCard key={`private-${req.id}`} req={req} onRefresh={triggerRefresh} />
                ))}

              {/* Empty states */}
              {((activeTab === "all" && filteredOpenBookings.length === 0 && filteredPrivateRequests.length === 0) ||
                (activeTab === "open" && filteredOpenBookings.length === 0) ||
                (activeTab === "private" && filteredPrivateRequests.length === 0)) && (
                <div className="rounded-2xl border border-dashed border-gray-300 py-16 px-4 text-center bg-gray-50/50">
                  <div className="flex justify-center mb-3">
                    <Luggage className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-sm font-bold text-gray-800">Belum ada riwayat pemesanan</p>
                  <p className="text-xs text-gray-400 mt-1 mb-6 max-w-sm mx-auto">
                    {searchQuery || statusFilter !== "all"
                      ? "Tidak ada pemesanan yang sesuai dengan filter pencarian Anda."
                      : activeTab === "open"
                      ? "Anda belum pernah memesan Open Trip."
                      : activeTab === "private"
                      ? "Anda belum pernah mengajukan Private Trip."
                      : "Jelajahi paket Open Trip atau buat perjalanan Private Trip impian Anda."}
                  </p>
                  <div className="flex justify-center gap-3 flex-wrap">
                    <Link
                      href="/trips"
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 text-xs font-bold text-gray-800 shadow-sm"
                    >
                      Jelajah Open Trip
                    </Link>
                    <Link
                      href="/private"
                      className="inline-flex items-center gap-2 rounded-xl text-white px-4 py-2 text-xs font-bold shadow-sm"
                      style={{ backgroundColor: A }}
                    >
                      Buat Private Trip
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
