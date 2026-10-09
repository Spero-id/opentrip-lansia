"use client";

import { useState } from "react";
import { PROPOSAL_COLOR, PROPOSAL_LABEL } from "./constants";
import { formatIDR } from "@/utils/format";
import type { PrivateProposal } from "@/features/my-trips";

export default function ProposalCard({
  proposal,
  requestId,
  requestStatus,
  onRefresh,
}: {
  proposal: PrivateProposal;
  requestId: string;
  requestStatus?: string | null;
  onRefresh?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  const handleAction = async (action: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/private-trips/${requestId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: proposal.id, action, revisionNote: note }),
      });
      if (res.ok) onRefresh?.();
    } catch {
      setLoading(false);
    }
  };

  if (requestStatus !== "revision" && proposal.status !== "pending") return null;

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Proposal</p>
          <p className="text-xs font-bold text-foreground mt-1">
            Estimasi Harga: {formatIDR(proposal.estimatedPrice)}
          </p>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${PROPOSAL_COLOR[proposal.status] || "bg-muted text-muted-foreground"}`}>
          {PROPOSAL_LABEL[proposal.status] || proposal.status}
        </span>
      </div>

      {proposal.proposalContent && (
        <p className="text-xs text-muted-foreground leading-relaxed">{proposal.proposalContent}</p>
      )}
      {proposal.inclusions && (
        <div className="text-xs">
          <span className="font-semibold text-foreground">Termasuk:</span>{" "}
          <span className="text-muted-foreground">{proposal.inclusions}</span>
        </div>
      )}
      {proposal.exclusions && (
        <div className="text-xs">
          <span className="font-semibold text-foreground">Tidak Termasuk:</span>{" "}
          <span className="text-muted-foreground">{proposal.exclusions}</span>
        </div>
      )}

      {proposal.status === "pending" && (
        <div className="flex gap-2 pt-1">
          <button onClick={() => handleAction("accept")} disabled={loading} className="flex-1 bg-success-500 text-success-950 text-xs font-bold py-2 rounded-lg hover:bg-success-600 disabled:opacity-40 transition">Terima</button>
          <button onClick={() => handleAction("reject")} disabled={loading} className="flex-1 bg-destructive-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-destructive-700 disabled:opacity-40 transition">Tolak</button>
          <button onClick={() => handleAction("revise")} disabled={loading} className="flex-1 bg-warning-500 text-warning-950 text-xs font-bold py-2 rounded-lg hover:bg-warning-600 disabled:opacity-40 transition">Revisi</button>
        </div>
      )}

      {requestStatus === "revision" && proposal.status === "pending" && (
        <div className="pt-1 space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Catatan revisi..."
            rows={2}
            className="w-full text-xs border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
          />
          <button
            onClick={() => handleAction("propose")}
            disabled={loading || !note.trim()}
            className="w-full bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-indigo-600 disabled:opacity-40 transition"
          >
            Kirim Revisi
          </button>
        </div>
      )}
    </div>
  );
}
