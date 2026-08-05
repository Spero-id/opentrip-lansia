"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// ─── Warna brand project ───────────────────────────────────────────────────
const A = "#F49D1A";

// ─── Label & warna status ─────────────────────────────────────────────────
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
  accepted: "Diterima ✓",
  rejected: "Ditolak",
  revised: "Diminta Revisi",
};
const PROPOSAL_COLOR = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-teal-100 text-teal-700",
  rejected: "bg-red-100 text-red-700",
  revised: "bg-purple-100 text-purple-700",
};

// ─── Helpers ──────────────────────────────────────────────────────────────
function formatRupiah(val) {
  if (!val || val === "0") return null;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(val));
}

/**
 * Menguraikan teks destinationPreferences yang disimpan sebagai plain-text
 * berformat:
 *   [Pemesan]
 *   Nama: X
 *   [Detail Perjalanan]
 *   Tanggal: X
 *   [Peserta (N orang)]
 *   1. Fulan | Lahir: ... | Laki-laki | HP: ...
 *
 * Mengembalikan array section: { heading, rows }
 */
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
        // Baris peserta: "1. Fulan | Lahir: ... | ..."
        const parts = line.split("|").map((s) => s.trim());
        currentSection.rows.push({ type: "participant", parts });
      }
    }
  }
  if (currentSection) sections.push(currentSection);
  return sections;
}

// ─── Ikon kecil ───────────────────────────────────────────────────────────
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
};

// ─── Komponen: Tampilan satu proposal ────────────────────────────────────
function ProposalCard({ proposal, requestId, requestStatus, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { type: "ok"|"err", text }

  const isActionable =
    (proposal.status === "pending" || proposal.status === "revised") &&
    requestStatus === "reviewed";

  async function handleAction(action) {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/private-trips/${requestId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: proposal.id, action }),
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
              ? "Permintaan revisi berhasil dikirim."
              : "Proposal telah ditolak.",
        });
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
      {/* Header proposal */}
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

      {/* Konten proposal */}
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          Detail Penawaran
        </p>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl p-3.5">
          {proposal.proposalContent}
        </p>
      </div>

      {/* Harga & fasilitas */}
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

      {/* Feedback setelah action */}
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

      {/* Tombol aksi */}
      {isActionable && (
        <div className="flex flex-wrap gap-2 pt-1">
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
            onClick={() => handleAction("revise")}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-purple-300 text-purple-700 hover:bg-purple-50 active:scale-95 px-4 py-2 text-xs font-bold transition disabled:opacity-50"
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
      )}
    </div>
  );
}

// ─── Komponen: Info request yang sudah di-parse ───────────────────────────
function ParsedPreferences({ text }) {
  const sections = parseDestinationPreferences(text);
  if (sections.length === 0) return null;

  return (
    <div className="space-y-3">
      {sections.map((sec, si) => {
        // ── Khusus: Asal Pemesanan ───────────────────────────────────────
        // Kalau hanya ada "Tipe: Individu" tanpa institusi, tampilkan ringkas
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

        // ── Default: section biasa ────────────────────────────────────────
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
                // Baris peserta
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

// ─── Komponen: Satu kartu request ─────────────────────────────────────────
function RequestCard({ req, onRefresh }) {
  const [open, setOpen] = useState(false);
  const pendingProposals = req.proposals?.filter(
    (p) => p.status === "pending" || p.status === "revised"
  ).length ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header — klik untuk expand */}
      <button
        id={`trip-card-${req.id}`}
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-gray-50/70 transition"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-bold text-gray-900 truncate">{req.title}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            <span className="text-xs text-gray-500">{req.durationDays} hari</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500">{req.participantsCount} peserta</span>
            {req.submittedAt && (
              <>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500">
                  {new Date(req.submittedAt).toLocaleDateString("id-ID", {
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
          <span
            className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            {icons.chevron}
          </span>
        </div>
      </button>

      {/* Detail (expand) */}
      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-5">

          {/* Budget */}
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

          {/* Detail permintaan (parsed) */}
          {req.destinationPreferences && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Detail Permintaan
              </p>
              <ParsedPreferences text={req.destinationPreferences} />
            </div>
          )}

          {/* Kebutuhan khusus */}
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

          {/* Proposal dari admin */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Proposal dari Admin
            </p>
            {!req.proposals || req.proposals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center">
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

// ─── Halaman utama ────────────────────────────────────────────────────────
export default function MyTripsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [requests, setRequests] = useState([]);
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

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/private-trips");
        if (!res.ok) {
          if (res.status === 401) { router.push("/login"); return; }
          throw new Error("Gagal memuat data");
        }
        const data = await res.json();

        // Ambil proposal per request
        const withProposals = await Promise.all(
          data.map(async (req) => {
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

        if (!cancelled) setRequests(withProposals);
      } catch (e) {
        if (!cancelled) setError(e.message || "Terjadi kesalahan");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [isPending, session, router, refreshKey]);

  if (isPending || (!session?.user && !error)) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-white">
          <p className="text-gray-400 text-sm">Memuat...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="min-h-screen bg-white">
        {/* Page header — konsisten dengan halaman private */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
            <p className="font-semibold text-sm tracking-wide mb-1" style={{ color: A }}>
              PRIVATE TRIP
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Request <span style={{ color: A }}>Saya</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1 max-w-lg">
              Pantau status pengajuan dan tanggapi proposal dari tim admin.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tombol ajukan baru */}
          <div className="mb-6">
            <a
              id="btn-new-trip-request"
              href="/private"
              className="inline-flex items-center gap-2 rounded-2xl text-white px-5 py-2.5 text-sm font-bold transition active:scale-95 shadow-md"
              style={{ backgroundColor: A }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#c47d12")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = A)}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Ajukan Request Baru
            </a>
          </div>

          {/* Content */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-6 text-center">
              <p className="text-sm text-red-700 font-semibold">{error}</p>
              <button
                onClick={triggerRefresh}
                className="mt-3 text-xs font-bold text-red-600 underline"
              >
                Coba lagi
              </button>
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
              <div className="text-4xl mb-3">🗺️</div>
              <p className="text-sm font-semibold text-gray-700">Belum ada request Private Trip</p>
              <p className="text-xs text-gray-400 mt-1 mb-5">
                Klik tombol di atas untuk mengajukan perjalanan impian Anda.
              </p>
              <a
                href="/private"
                className="inline-flex items-center gap-2 rounded-xl text-white px-4 py-2 text-sm font-bold"
                style={{ backgroundColor: A }}
              >
                Ajukan Sekarang
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <RequestCard key={req.id} req={req} onRefresh={triggerRefresh} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
