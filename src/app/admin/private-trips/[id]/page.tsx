"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, AlertCircle, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

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

export default function AdminPrivateTripDetail() {
  const params = useParams();
  const router = useRouter();
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
    if (!res.ok) { setActionMsg(result.error || "Gagal"); setSaving(false); return; }
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

      {/* Request Info */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-slate-900">{data.title}</h1>
          <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${statusStyles[data.status] || "bg-slate-100 text-slate-600"}`}>{data.status}</span>
        </div>

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

        <div>
          <span className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Destinasi yang Diinginkan</span>
          <p className="text-sm text-slate-700 bg-slate-50 rounded-2xl p-4">{data.destinationPreferences || "-"}</p>
        </div>

        {data.specialRequirements && (
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Kebutuhan Khusus</span>
            <p className="text-sm text-slate-700 bg-amber-50/50 rounded-2xl p-4 border border-amber-100/50">{data.specialRequirements}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-6 space-y-4">
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Aksi</h2>
        <div className="flex flex-wrap gap-3">
          {data.status === "submitted" && (
            <>
              <button onClick={() => updateStatus("review")} className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-xs font-bold transition">Tandai Sudah Ditinjau</button>
              <button onClick={() => setProposalOpen(true)} className="rounded-xl bg-[#F49D1A] hover:bg-[#c47d12] text-white px-4 py-2 text-xs font-bold transition">Buat Proposal</button>
              <button onClick={() => updateStatus("reject")} className="rounded-xl border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 text-xs font-bold transition">Tolak</button>
            </>
          )}
          {(data.status === "reviewed" || data.status === "revision") && (
            <>
              <button onClick={() => setProposalOpen(true)} className="rounded-xl bg-[#F49D1A] hover:bg-[#c47d12] text-white px-4 py-2 text-xs font-bold transition">Kirim / Perbarui Proposal</button>
              <button onClick={() => updateStatus("reject")} className="rounded-xl border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 text-xs font-bold transition">Tolak</button>
            </>
          )}
          {data.status === "approved" && (
            <span className="text-xs font-bold text-[#1CA6B7] flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Request sudah disetujui</span>
          )}
          {data.status === "rejected" && (
            <span className="text-xs font-bold text-red-600 flex items-center gap-2"><XCircle className="w-4 h-4" /> Request ditolak</span>
          )}
        </div>
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

      {/* Create Proposal Modal */}
      {proposalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setProposalOpen(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-extrabold text-slate-900">Buat Proposal Baru</h3>
            <form onSubmit={handleCreateProposal} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Konten Proposal <span className="text-red-500">*</span></label>
                <textarea
                  value={proposalContent}
                  onChange={(e) => setProposalContent(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A] resize-none"
                  placeholder="Deskripsikan rencana perjalanan, akomodasi, dan layanan..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Estimasi Harga</label>
                <input
                  type="number"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A]"
                  placeholder="0"
                  min={0}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Fasilitas Termasuk</label>
                  <textarea
                    value={inclusions}
                    onChange={(e) => setInclusions(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A] resize-none"
                    placeholder="Hotel, makan, transportasi..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Fasilitas Tidak Termasuk</label>
                  <textarea
                    value={exclusions}
                    onChange={(e) => setExclusions(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#F49D1A]/30 focus:border-[#F49D1A] resize-none"
                    placeholder="Tiket pribadi, belanja..."
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="rounded-xl bg-[#F49D1A] hover:bg-[#c47d12] text-white px-6 py-2.5 text-sm font-bold shadow-md shadow-[#F49D1A]/20 transition disabled:opacity-50 flex items-center gap-2">
                  {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Send className="w-4 h-4" /> Kirim Proposal</>}
                </button>
                <button type="button" onClick={() => setProposalOpen(false)}
                  className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
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
