"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Eye, Filter, ChevronDown, ClipboardCheck, FileSignature, Ban, Copy, Check } from "lucide-react";

interface PrivateRequest {
  id: string;
  title: string;
  userId: string;
  durationDays: number;
  participantsCount: number;
  status: string;
  submittedAt: string | null;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-foreground",
  submitted: "bg-warning-100 text-warning-800",
  reviewed: "bg-info-100 text-info-700",
  revision: "bg-purple-100 text-purple-700",
  approved: "bg-secondary/15 text-secondary-foreground",
  rejected: "bg-destructive-100 text-destructive-700",
};

function toRequestCode(id: string) {
  return "PTR-" + id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      title="Salin Kode"
      className="ml-1 p-0.5 hover:text-foreground transition"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-success-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function AdminPrivateTripsList() {
  const [rows, setRows] = useState<PrivateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const isCodeSearch = search.trim().toUpperCase().startsWith("PTR-");
  const apiSearch = isCodeSearch ? "" : search;

  const visibleRows = isCodeSearch
    ? rows.filter((r) => toRequestCode(r.id).includes(search.trim().toUpperCase()))
    : rows;

  async function fetchData() {
    setLoading(true);
    setFetchError("");
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (apiSearch) params.set("search", apiSearch);
    const res = await fetch(`/api/private-trip/admin?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) {
      setFetchError(`Error ${res.status}: ${data.error || "Gagal memuat data"}`);
      setRows([]);
      setTotal(0);
    } else {
      setRows(data.rows || []);
      setTotal(data.total || 0);
    }
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setFetchError("");
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (apiSearch) params.set("search", apiSearch);
      const res = await fetch(`/api/private-trip/admin?${params.toString()}`);
      const data = await res.json();
      if (!cancelled) {
        if (!res.ok) {
          setFetchError(`Error ${res.status}: ${data.error || "Gagal memuat data"}`);
          setRows([]);
          setTotal(0);
        } else {
          setRows(data.rows || []);
          setTotal(data.total || 0);
        }
        setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [statusFilter, apiSearch]);

  async function quickAction(id: string, action: string) {
    setActioningId(id);
    await fetch(`/api/private-trip/admin/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setActioningId(null);
    fetchData();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-6 rounded-3xl border border-border/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Private Trip Request</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola permintaan Private Trip dari pengguna.</p>
        </div>
      </div>

      {fetchError && (
        <div className="bg-destructive-50 border border-destructive-200 text-destructive-700 rounded-2xl px-5 py-3 text-sm font-medium">
          {fetchError}
        </div>
      )}

      <div className="bg-card rounded-3xl border border-border/80 shadow-xs p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>Filter:</span>
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none rounded-xl border border-border bg-card px-4 py-2 pr-8 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="">Semua Status</option>
            <option value="submitted">Submitted</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari judul atau kode PTR-..."
          className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-full sm:w-56"
        />
        <span className="text-xs text-muted-foreground ml-auto">
          {isCodeSearch ? `${visibleRows.length} hasil` : `${total} request`}
        </span>
      </div>

      <div className="bg-card rounded-3xl border border-border/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted text-muted-foreground font-semibold border-b border-border/80">
              <tr>
                <th className="px-6 py-4">Kode</th>
                <th className="px-6 py-4">Judul Perjalanan</th>
                <th className="px-6 py-4">Peserta</th>
                <th className="px-6 py-4">Durasi</th>
                <th className="px-6 py-4">Tgl Submit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">Memuat data...</td></tr>
              ) : visibleRows.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">Belum ada request Private Trip.</td></tr>
              ) : (
                visibleRows.map((r) => {
                  const busy = actioningId === r.id;
                  const canAct = r.status === "submitted" || r.status === "reviewed" || r.status === "revision";
                  const code = toRequestCode(r.id);
                  return (
                    <tr key={r.id} className="hover:bg-muted/60 transition">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-0.5 font-mono text-foreground bg-muted rounded px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap">
                          {code}
                          <CopyCodeButton code={code} />
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground max-w-xs truncate">{r.title}</td>
                      <td className="px-6 py-4 text-muted-foreground">{r.participantsCount} org</td>
                      <td className="px-6 py-4 text-muted-foreground">{r.durationDays} hari</td>
                      <td className="px-6 py-4 text-muted-foreground">{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString("id-ID") : "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${statusStyles[r.status] || "bg-muted text-muted-foreground"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status === "submitted" && (
                            <button
                              disabled={busy}
                              onClick={() => quickAction(r.id, "review")}
                              title="Tandai Sudah Ditinjau"
                              className="inline-flex items-center gap-1 rounded-xl bg-info-50 text-info-600 hover:bg-info-600 hover:text-white px-2.5 py-1.5 text-[11px] font-bold transition disabled:opacity-40"
                            >
                              <ClipboardCheck className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline">Tinjau</span>
                            </button>
                          )}
                          {false && canAct && (
                            <Link
                              href={`/admin/private-trips/${r.id}?proposal=1`}
                              title="Buat Proposal"
                              className="inline-flex items-center gap-1 rounded-xl bg-primary/10 text-primary-foreground hover:bg-primary hover:text-primary-foreground px-2.5 py-1.5 text-[11px] font-bold transition"
                            >
                              <FileSignature className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline">Proposal</span>
                            </Link>
                          )}
                          {canAct && (
                            <button
                              disabled={busy}
                              onClick={() => quickAction(r.id, "reject")}
                              title="Tolak Request"
                              className="inline-flex items-center gap-1 rounded-xl bg-destructive-50 text-destructive-500 hover:bg-destructive-600 hover:text-white px-2.5 py-1.5 text-[11px] font-bold transition disabled:opacity-40"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline">Tolak</span>
                            </button>
                          )}
                          <Link
                            href={`/admin/private-trips/${r.id}`}
                            title="Lihat Detail"
                            className="inline-flex items-center gap-1 rounded-xl bg-muted text-muted-foreground hover:bg-foreground hover:text-background px-2.5 py-1.5 text-[11px] font-bold transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">Detail</span>
                          </Link>
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
    </div>
  );
}

interface PrivateRequest {
  id: string;
  title: string;
  userId: string;
  durationDays: number;
  participantsCount: number;
  status: string;
  submittedAt: string | null;
  createdAt: string;
}

