"use client";

import { Check, X } from "lucide-react";
import type { AppliedVoucher } from "@/features/checkout";

export default function VoucherCard({
  voucherCode,
  setVoucherCode,
  appliedVoucher,
  voucherError,
  onApply,
  onRemove,
  vouchersLoading,
}: {
  voucherCode: string;
  setVoucherCode: (value: string) => void;
  appliedVoucher?: AppliedVoucher | null;
  voucherError?: string | null;
  onApply: () => void;
  onRemove: () => void;
  vouchersLoading: boolean;
}) {
  return (
    <div className="bg-background border border-border rounded-2xl p-5 space-y-3 shadow-sm">
      <h2 className="text-base font-bold text-foreground">Voucher / Kode Promo</h2>
      {appliedVoucher ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#1CA6B7]/10 border border-[#1CA6B7]/20">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#1CA6B7]" />
            <span className="text-sm font-semibold text-[#1CA6B7]">{appliedVoucher.label}</span>
          </div>
          <button onClick={onRemove} className="text-[#1CA6B7] hover:text-[#1CA6B7]">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={vouchersLoading ? "Memuat voucher..." : "Masukkan kode voucher"}
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onApply();
              }
            }}
            disabled={vouchersLoading}
            className="flex-1 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:bg-muted disabled:cursor-not-allowed"
          />
          <button
            onClick={onApply}
            disabled={vouchersLoading}
            className="bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {vouchersLoading ? "..." : "Pakai"}
          </button>
        </div>
      )}
      {voucherError && <p className="text-xs text-destructive">{voucherError}</p>}
    </div>
  );
}
