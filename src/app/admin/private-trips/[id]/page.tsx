"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Send, AlertCircle, CheckCircle2, XCircle, RefreshCw, MapPin, ClipboardCheck, FileSignature, Ban } from "lucide-react";

interface Proposal {
  id: string;
  proposalContent: string;
  estimatedPrice: string | null;
  inclusions: string | null;
  exclusions: string | null;
  status: string;
  adminId: string;
  createdAt: string;
}

interface RequestDetail {
  id: string;
  title: string;
  userId: string;
  durationDays: number;
  participantsCount: number;
  destinationPreferences: string | null;
  specialRequirements: string | null;
  budgetEstimate: string | null;
  status: string;
  submittedAt: string | null;
  createdAt: string;
  proposals: Proposal[];
}

const statusStyles: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  submitted: "bg-amber-100 text-amber-800",
  reviewed: "bg-blue-100 text-blue-700",
  revision: "bg-purple-100 text-purple-700",
  approved: "bg-[#1CA6B7]/15 text-[#1CA6B7]",
  rejected: "bg-red-100 text-red-700",
};

const proposalStatusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-[#1CA6B7]/15 text-[#1CA6B7]",
  rejected: "bg-red-100 text-red-700",
  revised: "bg-purple-100 text-purple-700",
};

/** Parses the structured destinationPreferences text into sections.
 *  Format: [Header]\nKey: Value\n...  */
function parseDestinationPreferences(text: string): { heading: string; rows: { key: string; val: string }[] }[] {
  if (!text) return [];
  const sections: { heading: string; rows: { key: string; val: string }[] }[] = [];
  let current: { heading: string; rows: { key: string; val: string }[] } | null = null;

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const headerMatch = line.match(/^\[(.+)\]$/);
    if (headerMatch) {
      if (current) sections.push(current);
      current = { heading: headerMatch[1], rows: [] };
    } else if (current) {
      const colonIdx = line.indexOf(": ");
      if (colonIdx > 0) {
        current.rows.push({ key: line.slice(0, colonIdx).trim(), val: line.slice(colonIdx + 2).trim() });
      } else {
        // baris tanpa "Key: val" — tampilkan sebagai nilai saja
        current.rows.push({ key: "", val: line });
      }
    }
  }
  if (current) sections.push(current);
  return sections;
}

const sectionIcons: Record<string, React.ReactNode> = {
  "Pemesan":          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  "Detail Perjalanan":<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  "Asal Pemesanan":   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  "Peserta":          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
};

function DestinationTable({ raw }: { raw: string }) {
  const sections = parseDestinationPreferences(raw);

  if (sections.length === 0) {
    // fallback: teks biasa tanpa format
    return (
      <div className="bg-slate-50 rounded-2xl px-4 py-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
        {raw}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {sections.map((sec, si) => (
        <div key={si} className="rounded-2xl border border-slate-200 overflow-hidden">
          {/* Section header */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
            <span className="text-[#F49D1A]">{sectionIcons[sec.heading] ?? <MapPin className="w-4 h-4" />}</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{sec.heading}</span>
          </div>
          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {sec.rows.length === 0 && (
              <p className="px-4 py-3 text-xs text-slate-400 italic">Tidak ada data</p>
            )}
            {sec.rows.map((row, ri) => (
              <div key={ri} className="flex items-start gap-2 px-4 py-2.5">
                {row.key && (
                  <span className="text-[11px] font-semibold text-slate-400 w-36 shrink-0 pt-0.5">{row.key}</span>
                )}
                <span className={`text-xs font-medium text-slate-800 ${!row.key ? "italic text-slate-500" : ""}`}>{row.val || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Memisahkan teks specialRequirements menjadi bagian kebutuhan awal
 *  dan catatan revisi yang di-append dengan format [Catatan Revisi – ...] */
function SpecialRequirementsBlock({ raw }: { raw: string }) {
  // Pisah berdasarkan marker catatan revisi
  const revisionMarker = /\n\[Catatan Revisi\s*[–-][^\]]*\]/g;
  const parts = raw.split(/(?=\n\[Catatan Revisi)/);

  const original = parts[0].trim();
  const revisions = parts.slice(1).map((block) => {
    const headerMatch = block.match(/^\n\[Catatan Revisi\s*[–-]\s*([^\]]+)\]/);
    const timestamp = headerMatch?.[1]?.trim() ?? "";
    const note = block.replace(/^\n\[Catatan Revisi[^\]]*\]\n?/, "").trim();
    return { timestamp, note };
  });

  return (
    <div className="space-y-2">
      {/* Kebutuhan khusus asli */}
      {original && (
        <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100/50">
          <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide mb-1">Kebutuhan Khusus</p>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{original}</p>
        </div>
      )}
      {/* Catatan revisi dari user */}
      {revisions.map((rev, i) => (
        <div key={i} className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-purple-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
            </svg>
            <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wide">
              Catatan Revisi {revisions.length > 1 ? `#${i + 1}` : ""}
            </p>
            {rev.timestamp && (
              <span className="text-[10px] text-purple-400 ml-auto">{rev.timestamp}</span>
            )}
          </div>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap pl-5">{rev.note || "—"}</p>
        </div>
      ))}
    </div>
  );
}

export default function AdminPrivateTripDetail() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Proposal form
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposalContent, setProposalContent] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [inclusions, setInclusions] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  async function fetchDetail() {
    setLoading(true);
    const res = await fetch(`/api/private-trip/admin/${params.id}`);
    if (!res.ok) { setError("Gagal memuat data"); setLoading(false); return; }
    const d = await res.json();
    setData(d);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      const res = await fetch(`/api/private-trip/admin/${params.id}`);
      if (!res.ok) { if (!cancelled) { setError("Gagal memuat data"); setLoading(false); } return; }
      const d = await res.json();
      if (!cancelled) { setData(d); setLoading(false); }
    }
    run();
    return () => { cancelled = true; };
  }, [params.id]);

  // Auto-buka proposal modal jika ada ?proposal=1 dari list page
  useEffect(() => {
    if (searchParams.get("proposal") === "1") {
      setProposalOpen(true);
    }
  }, [searchParams]);

  async function updateStatus(action: string) {
    setActionMsg("");
    const res = await fetch(`/api/private-trip/admin/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const result = await res.json();
    if (!res.ok) { setActionMsg(result.error || "Gagal"); return; }
    setActionMsg("Status berhasil diperbarui!");
    fetchDetail();
  }

  async function handleCreateProposal(e: React.FormEvent) {
    e.preventDefault();
    setActionMsg("");
    if (!proposalContent.trim()) { setActionMsg("Konten proposal wajib diisi"); return; }

    // Validasi estimatedPrice — max numeric(14,2) = 999_999_999_999.99
    if (estimatedPrice) {
      const num = Number(estimatedPrice);
      if (isNaN(num) || num < 0) { setActionMsg("Estimasi harga tidak valid"); return; }
      if (num > 999_999_999_999.99) { setActionMsg("Estimasi harga maksimal Rp 999.999.999.999"); return; }
    }

    setSaving(true);
    const res = await fetch(`/api/private-trip/admin/${params.id}/proposals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proposalContent,
        estimatedPrice: estimatedPrice || "0",
        inclusions,
        exclusions,
      }),
    });
    const result = await res.json();
    if (!res.ok) { setActionMsg(result.error || "Gagal mengirim proposal"); setSaving(false); return; }
    setActionMsg("Proposal berhasil dikirim!");
    setProposalOpen(false);
    setProposalContent("");
    setEstimatedPrice("");
    setInclusions("");
    setExclusions("");
    setSaving(false);
    fetchDetail();
  }

  function formatRupiah(val: string | null) {
    if (!val) return "-";
    const num = Number(val);
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
  }

  if (loading) return <div className="p-12 text-center text-slate-400">Memuat detail request...</div>;
  if (error || !data) return <div className="p-12 text-center text-red-500">{error || "Data tidak ditemukan"}</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button */}
      <button onClick={() => router.push("/admin/private-trips")} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#F49D1A] transition">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
      </button>

      {actionMsg && (
        <div className={`flex items-start gap-3 rounded-2xl p-4 text-sm ${actionMsg.includes("gagal") || actionMsg.includes("Gagal") ? "bg-red-50 border border-red-200 text-red-700" : "bg-[#1CA6B7]/10 border border-[#1CA6B7]/20 text-[#1CA6B7]"}`}>
          {actionMsg.includes("gagal") || actionMsg.includes("Gagal") ? <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Request Info + Action Buttons */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-6 space-y-5">
        {/* Header: title, status badge, dan action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold text-slate-900 leading-tight">{data.title}</h1>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[11px] font-bold ${statusStyles[data.status] || "bg-slate-100 text-slate-600"}`}>{data.status}</span>
          </div>
          {/* Action buttons inline di header */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {data.status === "submitted" && (
              <>
                <button
                  onClick={() => updateStatus("review")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-xs font-bold transition shadow-sm"
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  Tandai Sudah Ditinjau
                </button>
                <button
                  onClick={() => { setActionMsg(""); setProposalOpen(true); }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#F49D1A] hover:bg-[#c47d12] text-white px-4 py-2 text-xs font-bold transition shadow-sm shadow-[#F49D1A]/20"
                >
                  <FileSignature className="w-3.5 h-3.5" />
                  Buat Proposal
                </button>
                <button
                  onClick={() => updateStatus("reject")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 text-xs font-bold transition"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Tolak
                </button>
              </>
            )}
            {(data.status === "reviewed" || data.status === "revision") && (
              <>
                <button
                  onClick={() => { setActionMsg(""); setProposalOpen(true); }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#F49D1A] hover:bg-[#c47d12] text-white px-4 py-2 text-xs font-bold transition shadow-sm shadow-[#F49D1A]/20"
                >
                  <FileSignature className="w-3.5 h-3.5" />
                  Kirim / Perbarui Proposal
                </button>
                <button
                  onClick={() => updateStatus("reject")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 text-xs font-bold transition"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Tolak
                </button>
              </>
            )}
            {data.status === "approved" && (
              <span className="inline-flex items-center gap-2 text-xs font-bold text-[#1CA6B7] bg-[#1CA6B7]/10 px-3 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4" /> Sudah disetujui
              </span>
            )}
            {data.status === "rejected" && (
              <span className="inline-flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-xl">
                <XCircle className="w-4 h-4" /> Request ditolak
              </span>
            )}
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 uppercase">Durasi</span>
            <span className="font-bold text-slate-900">{data.durationDays} hari</span>
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 uppercase">Peserta</span>
            <span className="font-bold text-slate-900">{data.participantsCount} orang</span>
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 uppercase">Budget</span>
            <span className="font-bold text-slate-900">{formatRupiah(data.budgetEstimate)}</span>
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 uppercase">Tgl Submit</span>
            <span className="font-bold text-slate-900">{data.submittedAt ? new Date(data.submittedAt).toLocaleDateString("id-ID") : "-"}</span>
          </div>
        </div>

        {/* Destinasi — ditampilkan sebagai tabel/badges per item */}
        <div>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase mb-3">
            <MapPin className="w-3.5 h-3.5" /> Detail Permintaan
          </span>
          {data.destinationPreferences ? (
            <DestinationTable raw={data.destinationPreferences} />
          ) : (
            <p className="text-sm text-slate-400 italic">Tidak ada preferensi destinasi.</p>
          )}
        </div>

        {data.specialRequirements && (
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 uppercase mb-2">Kebutuhan Khusus &amp; Catatan Revisi</span>
            <SpecialRequirementsBlock raw={data.specialRequirements} />
          </div>
        )}
      </div>

      {/* Proposals History */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-6 space-y-4">
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Riwayat Proposal ({data.proposals?.length || 0})</h2>
        {(!data.proposals || data.proposals.length === 0) ? (
          <p className="text-sm text-slate-400">Belum ada proposal.</p>
        ) : (
          <div className="space-y-4">
            {data.proposals.map((prop) => (
              <div key={prop.id} className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${proposalStatusStyles[prop.status] || "bg-slate-100 text-slate-600"}`}>{prop.status}</span>
                  <span className="text-[11px] text-slate-400">{new Date(prop.createdAt).toLocaleString("id-ID")}</span>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{prop.proposalContent}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="block font-semibold text-slate-500">Estimasi Harga</span>
                    <span className="font-bold text-[#F49D1A]">{formatRupiah(prop.estimatedPrice)}</span>
                  </div>
                  <div>
                    <span className="block font-semibold text-slate-500">Termasuk</span>
                    <span className="text-slate-700">{prop.inclusions || "-"}</span>
                  </div>
                  <div>
                    <span className="block font-semibold text-slate-500">Tidak Termasuk</span>
                    <span className="text-slate-700">{prop.exclusions || "-"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Proposal Panel — bottom sheet di mobile, side panel di desktop */}
      {proposalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setProposalOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Panel */}
          <div
            className="relative bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92dvh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#F49D1A]/10 flex items-center justify-center">
                  <FileSignature className="w-4 h-4 text-[#F49D1A]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Buat Proposal</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[220px] sm:max-w-xs">{data?.title}</p>
                </div>
              </div>
              <button
                onClick={() => setProposalOpen(false)}
                className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable form body */}
            <form onSubmit={handleCreateProposal} className="flex flex-col flex-1 min-h-0">
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

                {/* Error/success inline */}
                {actionMsg && !actionMsg.includes("berhasil") && (
                  <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {actionMsg}
                  </div>
                )}

                {/* Konten Proposal */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Deskripsi Proposal <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={proposalContent}
                    onChange={(e) => setProposalContent(e.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A] focus:bg-white resize-none transition"
                    placeholder="Deskripsikan rencana perjalanan, akomodasi, transportasi, dan layanan yang ditawarkan..."
                    required
                  />
                </div>

                {/* Estimasi Harga */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Estimasi Harga (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      value={estimatedPrice}
                      onChange={(e) => setEstimatedPrice(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A] focus:bg-white transition"
                      placeholder="0"
                      min={0}
                      max={999999999999}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Maks. Rp 999.999.999.999</p>
                </div>

                {/* Termasuk & Tidak Termasuk */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                        Sudah Termasuk
                      </span>
                    </label>
                    <textarea
                      value={inclusions}
                      onChange={(e) => setInclusions(e.target.value)}
                      rows={4}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 focus:bg-white resize-none transition"
                      placeholder={"Hotel bintang 3\nMakan 3x sehari\nTransportasi AC\nGuide lokal"}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                        Tidak Termasuk
                      </span>
                    </label>
                    <textarea
                      value={exclusions}
                      onChange={(e) => setExclusions(e.target.value)}
                      rows={4}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 focus:bg-white resize-none transition"
                      placeholder={"Tiket pesawat\nBelanja pribadi\nObat-obatan"}
                    />
                  </div>
                </div>

              </div>

              {/* Footer actions — sticky */}
              <div className="px-5 py-4 border-t border-slate-100 flex items-center gap-3 shrink-0">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F49D1A] hover:bg-[#c47d12] active:scale-95 text-white px-6 py-3 text-sm font-bold shadow-md shadow-[#F49D1A]/25 transition disabled:opacity-50"
                >
                  {saving
                    ? <><RefreshCw className="w-4 h-4 animate-spin" /> Mengirim...</>
                    : <><Send className="w-4 h-4" /> Kirim Proposal</>
                  }
                </button>
                <button
                  type="button"
                  onClick={() => setProposalOpen(false)}
                  className="flex-1 sm:flex-none rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 active:scale-95 transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
