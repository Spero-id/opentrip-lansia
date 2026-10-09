"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { ScrollText, ChevronDown, ChevronRight, Filter, User, Clock } from "lucide-react";

interface AuditEntry {
  id: string;
  adminId: string | null;
  adminName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  description: string | null;
  createdAt: string | null;
}

const ENTITY_OPTIONS = [
  { value: "", label: "Semua entitas" },
  { value: "user", label: "User" },
  { value: "payment", label: "Pembayaran" },
  { value: "trip_price", label: "Tier trip" },
];

const ACTION_OPTIONS = [
  { value: "", label: "Semua aksi" },
  { value: "create", label: "Dibuat" },
  { value: "update", label: "Diubah" },
  { value: "delete", label: "Hapus" },
];

const ACTION_STYLES: Record<string, string> = {
  create: "bg-success-50 text-success-700",
  update: "bg-secondary/15 text-secondary-foreground",
  delete: "bg-destructive-50 text-destructive-700",
};

function formatDateTime(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "kosong";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function Changes({ entry }: { entry: AuditEntry }) {
  const keys = useMemo(() => {
    const set = new Set<string>();
    for (const source of [entry.oldValues, entry.newValues]) {
      if (!source) continue;
      for (const key of Object.keys(source)) set.add(key);
    }
    return [...set];
  }, [entry.oldValues, entry.newValues]);

  if (keys.length === 0) return <span className="text-muted-foreground">-</span>;

  return (
    <ul className="space-y-1 text-[11px] text-muted-foreground">
      {keys.map((key) => {
        const before = entry.oldValues ? formatValue(entry.oldValues[key]) : null;
        const after = entry.newValues ? formatValue(entry.newValues[key]) : null;
        return (
          <li key={key} className="flex flex-wrap items-center gap-1">
            <span className="font-semibold text-foreground">{key}</span>
            {before !== null && (
              <>
                <span className="text-muted-foreground line-through">{before}</span>
                <span className="text-muted-foreground">&rarr;</span>
              </>
            )}
            <span className={before !== null ? "font-medium text-foreground" : "text-muted-foreground"}>{after}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function AdminAuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entityType, setEntityType] = useState("");
  const [action, setAction] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (entityType) params.set("entityType", entityType);
      if (action) params.set("action", action);
      params.set("limit", "100");
      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal memuat audit log");
      setEntries(await res.json());
      setError(null);
    } catch {
      setError("Gagal memuat audit log.");
    } finally {
      setLoading(false);
    }
  }, [entityType, action]);

  useEffect(() => {
    async function initial() {
      await load();
    }
    void initial();
  }, [load]);

  const hasFilter = Boolean(entityType || action);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-6 rounded-3xl border border-border/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-1">Jejak perubahan penting oleh admin. Catatan bersifat permanen dan tidak dapat diubah.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1.5">
          <ScrollText className="w-4 h-4 text-secondary-foreground" />
          {entries.length} catatan terbaru
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border/80 shadow-xs p-4 sm:p-5 flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground pb-2">
          <Filter className="w-4 h-4" />
          Filter
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="audit-entity" className="text-[11px] font-semibold text-muted-foreground">Entitas</label>
          <select
            id="audit-entity"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-card"
          >
            {ENTITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="audit-action" className="text-[11px] font-semibold text-muted-foreground">Aksi</label>
          <select
            id="audit-action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-card"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {hasFilter && (
          <button
            onClick={() => {
              setEntityType("");
              setAction("");
            }}
            className="text-xs font-medium text-primary-foreground/90 hover:text-primary-foreground pb-2.5"
          >
            Reset filter
          </button>
        )}
      </div>

      <div className="bg-card rounded-3xl border border-border/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted text-muted-foreground font-semibold border-b border-border/80">
              <tr>
                <th className="px-4 py-4 w-8" />
                <th className="px-4 py-4">Waktu</th>
                <th className="px-4 py-4">Admin</th>
                <th className="px-4 py-4">Aksi</th>
                <th className="px-4 py-4">Entitas</th>
                <th className="px-4 py-4">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Memuat data...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-destructive-500">{error}</td></tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    {hasFilter ? "Tidak ada catatan pada filter ini." : "Tidak ada aktivitas tercatat."}
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const isOpen = expanded === entry.id;
                  return (
                    <Fragment key={entry.id}>
                      <tr className="hover:bg-muted/60 transition">
                        <td className="px-4 py-4">
                          <button
                            onClick={() => setExpanded(isOpen ? null : entry.id)}
                            aria-expanded={isOpen}
                            aria-label={isOpen ? "Sembunyikan perubahan" : "Lihat perubahan"}
                            className="text-muted-foreground hover:text-foreground transition"
                          >
                            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">{formatDateTime(entry.createdAt)}</td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 text-foreground">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                            {entry.adminName || "Sistem"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${ACTION_STYLES[entry.action] ?? "bg-muted text-muted-foreground"}`}>
                            {entry.action}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-mono text-[11px] text-muted-foreground">{entry.entityType}</td>
                        <td className="px-4 py-4 text-foreground">{entry.description || "-"}</td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-muted/60">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="flex items-start gap-2">
                              <Clock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                              <Changes entry={entry} />
                            </div>
                            {entry.entityId && (
                              <p className="mt-3 text-[10px] text-muted-foreground font-mono">id: {entry.entityId}</p>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
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