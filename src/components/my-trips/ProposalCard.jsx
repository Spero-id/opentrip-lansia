"use client";

import { useState } from "react";
import { PROPOSAL_COLOR, PROPOSAL_LABEL, formatRupiah } from "./constants";

export default function ProposalCard({ proposal, requestId, requestStatus, onRefresh }) {
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
          <p className="text-xs font-bold text-gray-800 mt-1">
            Estimasi Harga: {formatRupiah(proposal.estimatedPrice)}
          </p>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${PROPOSAL_COLOR[proposal.status] || "bg-gray-100 text-gray-600"}`}>
          {PROPOSAL_LABEL[proposal.status] || proposal.status}
        </span>
      </div>

      {proposal.proposalContent && (
        <p className="text-xs text-gray-600 leading-relaxed">{proposal.proposalContent}</p>
      )}
      {proposal.inclusions && (
        <div className="text-xs">
          <span className="font-semibold text-gray-700">Termasuk:</span>{" "}
          <span className="text-gray-500">{proposal.inclusions}</span>
        </div>
      )}
      {proposal.exclusions && (
        <div className="text-xs">
          <span className="font-semibold text-gray-700">Tidak Termasuk:</span>{" "}
          <span className="text-gray-500">{proposal.exclusions}</span>
        </div>
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
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Catatan revisi..."
            rows={2}
            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#F49D1A]/30 resize-none"
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
