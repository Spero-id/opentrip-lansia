"use client";

import { useState, type MouseEvent } from "react";
import { A, STATUS_COLOR, STATUS_LABEL, toRequestCode, icons } from "./constants";
import { formatIDR } from "@/utils/format";
import ParsedPreferences from "./ParsedPreferences";
import ProposalCard from "./ProposalCard";
import type { PrivateTripRequest } from "@/features/my-trips";

export default function RequestCard({ req, onRefresh }: { req: PrivateTripRequest; onRefresh?: () => void }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const COPY_TIMEOUT_MS = 2000;

  const requestCode = toRequestCode(req.id);

  const copyCode = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigator.clipboard.writeText(requestCode);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_TIMEOUT_MS);
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md transition">
      <div
        role="button"
        tabIndex={0}
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-muted/70 transition cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((v) => !v); } }}
      >
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Private Trip
            </span>
            <p className="text-sm font-bold text-foreground truncate">{req.title}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-mono text-foreground bg-muted rounded px-2 py-0.5">
              {requestCode}
              <button onClick={copyCode} title="Salin Kode Request" className="hover:text-foreground transition p-0.5">
                {copied ? icons.copied : icons.copy}
              </button>
            </span>
            <span>·</span>
            <span>{req.durationDays} Hari</span>
            <span>·</span>
            <span>{req.participantsCount} Peserta</span>
            {req.budgetEstimate && (<><span>·</span><span>{formatIDR(req.budgetEstimate)}</span></>)}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLOR[req.status] || "bg-muted text-muted-foreground"}`}>
            {STATUS_LABEL[req.status] || req.status}
          </span>
          <span className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            {icons.chevron}
          </span>
        </div>
      </div>

      {open && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-4 bg-muted/30">
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Detail Pemesanan</p>
            <ParsedPreferences text={req.destinationPreferences} />
          </div>

          {req.specialRequirements && (
            <div className="bg-card rounded-xl border border-border p-4 space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Kebutuhan Khusus</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{req.specialRequirements}</p>
            </div>
          )}

          <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              Dibuat: {new Date(req.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold px-2.5 py-1 rounded-lg" style={{ backgroundColor: `${A}15`, color: "var(--primary-foreground)" }}>
              {requestCode}
              <button onClick={copyCode} title="Salin Kode Request" className="hover:opacity-70 transition p-0.5">
                {copied ? icons.copied : icons.copy}
              </button>
            </span>
          </div>

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
