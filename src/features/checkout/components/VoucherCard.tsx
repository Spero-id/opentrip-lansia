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
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
      <h2 className="text-base font-bold text-foreground">Voucher / Kode Promo</h2>
      {appliedVoucher ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/10 border border-secondary/20">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-secondary-foreground" />
            <span className="text-sm font-semibold text-secondary-foreground">{appliedVoucher.label}</span>
          </div>
          <button onClick={onRemove} className="text-secondary-foreground hover:text-secondary-foreground">
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
            className="flex-1 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-muted disabled:cursor-not-allowed"
          />
          <button
            onClick={onApply}
            disabled={vouchersLoading}
            className="bg-foreground text-background px-5 py-3 rounded-xl text-sm font-semibold hover:bg-foreground transition-colors disabled:bg-muted-foreground disabled:cursor-not-allowed"
          >
            {vouchersLoading ? "..." : "Pakai"}
          </button>
        </div>
      )}
      {voucherError && <p className="text-xs text-destructive-500">{voucherError}</p>}
    </div>
  );
}
