"use client";

import { Check, X, AlertCircle } from "lucide-react";
import type { AppliedReferral } from "@/features/checkout";

export default function ReferralInput({
  referralCode,
  setReferralCode,
  appliedReferral,
  referralError,
  onApply,
  onRemove,
}: {
  referralCode: string;
  setReferralCode: (value: string) => void;
  appliedReferral?: AppliedReferral | null;
  referralError?: string | null;
  onApply: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-bold text-foreground">Kode Referral</h2>
        <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold">
          Opsional
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Punya kode referral dari teman? Masukkan di sini untuk mencatat referral.
      </p>

      {appliedReferral ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-success-50 border border-success-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-success-600" />
            <div>
              <span className="text-sm font-semibold text-success-700">
                {appliedReferral.code}
              </span>
              <p className="text-[10px] text-success-600">
                Oleh: {appliedReferral.referrerName}
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="text-success-600 hover:text-success-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Masukkan kode referral"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              className="flex-1 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-success-500/20 focus:border-success-500 uppercase"
            />
            <button
              onClick={onApply}
              disabled={!referralCode.trim()}
              className="bg-foreground text-background px-5 py-3 rounded-xl text-sm font-semibold hover:bg-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Pakai
            </button>
          </div>

          {referralCode.trim() && (
            <p className="text-[11px] text-warning-600">
              Tekan <span className="font-semibold">Pakai</span> agar kode ini ikut
              tercatat saat pesanan dibuat.
            </p>
          )}
        </div>
      )}

      {referralError && (
        <div className="flex items-center gap-2 text-xs text-destructive-500">
          <AlertCircle size={12} />
          {referralError}
        </div>
      )}
    </div>
  );
}
