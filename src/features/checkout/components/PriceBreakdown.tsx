"use client";

import { useState } from "react";
import TermsModal from "./TermsModal";
import { formatIDR } from "@/utils/format";
import type { AppliedVoucher, DestinationSummary, TermsModalType } from "@/features/checkout";

export default function PriceBreakdown({
  destination,
  pricePerPax,
  pax,
  ticketSubtotal,
  discount,
  total,
  appliedVoucher,
  agreeToTerms,
  setAgreeToTerms,
  canProceed,
  onNext,
  hideTerms,
  isLoading,
  error,
  tierLines,
}: {
  destination?: DestinationSummary | null;
  pricePerPax: number;
  pax: number;
  ticketSubtotal: number;
  discount: number;
  total: number;
  appliedVoucher?: AppliedVoucher | null;
  agreeToTerms?: boolean;
  setAgreeToTerms?: (value: boolean) => void;
  canProceed?: unknown;
  onNext?: () => void;
  hideTerms?: boolean;
  isLoading?: boolean;
  error?: string | null;
  tierLines?: Array<{ name: string; qty: number; amount: number }>;
}) {
  const [modalType, setModalType] = useState<TermsModalType | null>(null);

  const handleAgree = () => {
    setAgreeToTerms?.(true);
    setModalType(null);
  };

  const perPax = pax > 0 ? Math.round(total / pax) : 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3 sticky top-24">
      <h2 className="text-base font-bold text-foreground">Ringkasan Harga</h2>

      <div className="space-y-3">
        <div className="flex justify-between items-start text-sm">
          <div>
            <p className="text-muted-foreground">Tiket wisata</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {destination?.title} · {formatIDR(pricePerPax)} ×{" "}
              {pax} peserta
            </p>
            {tierLines && tierLines.length > 0 && (
              <div className="mt-1.5 space-y-0.5">
                {tierLines.map((line) => (
                  <p key={line.name} className="text-[11px] text-muted-foreground">
                    {line.name} × {line.qty} = {formatIDR(line.amount)}
                  </p>
                ))}
              </div>
            )}
          </div>
          <span className="font-semibold text-foreground">
            {formatIDR(ticketSubtotal)}
          </span>
        </div>

        {discount > 0 && appliedVoucher && (
          <div className="flex justify-between items-center text-sm p-3 rounded-xl border bg-warning-50 border-warning-100">
            <div className="flex items-center gap-2">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                className="stroke-primary/90"
                strokeWidth="2.8"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <div>
                <span className="font-bold text-primary-foreground">
                  {appliedVoucher.code}
                </span>
                <p className="text-[10px] text-muted-foreground">
                  {appliedVoucher.label}
                </p>
              </div>
            </div>
            <span className="font-bold text-primary-foreground">
              −{formatIDR(discount)}
            </span>
          </div>
        )}

        <div className="border-t border-border pt-3 flex justify-between items-end">
          <div>
            <p className="text-sm font-bold text-foreground">Total Pembayaran</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatIDR(perPax)} / peserta
            </p>
          </div>
          <span className="text-xl font-bold text-foreground">
            {formatIDR(total)}
          </span>
        </div>
      </div>

      {!hideTerms && (
        <div className="border-t border-border pt-4 space-y-4">
          {error && (
            <div className="text-xs font-semibold text-destructive-600 bg-destructive-50 border border-destructive-100 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
          <div
            className="flex items-start gap-3 cursor-pointer"
            onClick={() => setModalType("terms")}
          >
            <input
              type="checkbox"
              checked={agreeToTerms}
              readOnly
              className="mt-1 w-4 h-4 rounded border-border text-primary-foreground focus:ring-primary/30 pointer-events-none"
            />
            <span className="text-xs text-muted-foreground">
              Saya setuju dengan{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalType("terms");
                }}
                className="text-primary-foreground font-semibold hover:underline"
              >
                syarat & ketentuan
              </button>{" "}
              serta{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalType("privacy");
                }}
                className="text-primary-foreground font-semibold hover:underline"
              >
                kebijakan privasi
              </button>{" "}
              yang berlaku.
            </span>
          </div>

          <button
            onClick={onNext}
            disabled={!canProceed || !agreeToTerms || isLoading}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Memproses...
              </>
            ) : (
              "Lanjut ke Pembayaran"
            )}
          </button>
        </div>
      )}

      {modalType && (
        <TermsModal
          type={modalType}
          onClose={() => setModalType(null)}
          onAgree={handleAgree}
        />
      )}
    </div>
  );
}
