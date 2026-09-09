"use client";

import { useState } from "react";
import { Copy, Check, Share2, ExternalLink } from "lucide-react";

export default function ReferralCard({ referralCode, stats }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = referralCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hai! Aku lagi cari trip seru nih. Pakai kode referral aku ${referralCode} ya biar kita bisa dapat bonus bareng! 🎉\n\nDaftar di: ${window.location.origin}/register?ref=${referralCode}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareLink = () => {
    const link = `${window.location.origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    alert("Link referral sudah disalin!");
  };

  if (!referralCode) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Kode Referral</h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Bagikan kode ini ke temanmu. Mereka akan tercatat sebagai referral
            kamu.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition-colors"
          >
            <Share2 size={12} />
            WhatsApp
          </button>
          <button
            onClick={shareLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            <ExternalLink size={12} />
            Link
          </button>
        </div>
      </div>

      {/* Referral Code Display */}
      <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-[#FEF6E7] border border-[#F3E2C0]">
        <div className="flex-1">
          <p className="text-2xl font-mono font-bold text-[#c47d12] tracking-wider">
            {referralCode}
          </p>
        </div>
        <button
          onClick={copyCode}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            copied
              ? "bg-green-500 text-white"
              : "bg-[#F49D1A] text-white hover:bg-[#c47d12]"
          }`}
        >
          {copied ? (
            <>
              <Check size={14} />
              Tersalin!
            </>
          ) : (
            <>
              <Copy size={14} />
              Salin
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500">Total Referral</p>
            <p className="text-lg font-bold text-slate-900">
              {stats.totalReferred ?? 0}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500">Total Komisi</p>
            <p className="text-lg font-bold text-slate-900">
              Rp {(stats.totalCommission ?? 0).toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
