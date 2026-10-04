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
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3 sticky top-24">
      <h2 className="text-base font-bold text-gray-900">Ringkasan Harga</h2>

      <div className="space-y-3">
        <div className="flex justify-between items-start text-sm">
          <div>
            <p className="text-gray-600">Tiket wisata</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {destination?.title} · {formatIDR(pricePerPax)} ×{" "}
              {pax} peserta
            </p>
            {tierLines && tierLines.length > 0 && (
              <div className="mt-1.5 space-y-0.5">
                {tierLines.map((line) => (
                  <p key={line.name} className="text-[11px] text-gray-400">
                    {line.name} × {line.qty} = {formatIDR(line.amount)}
                  </p>
                ))}
              </div>
            )}
          </div>
          <span className="font-semibold text-gray-700">
            {formatIDR(ticketSubtotal)}
          </span>
        </div>

        {discount > 0 && appliedVoucher && (
          <div className="flex justify-between items-center text-sm p-3 rounded-xl border bg-orange-50 border-orange-100">
            <div className="flex items-center gap-2">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#df7224"
                strokeWidth="2.8"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <div>
                <span className="font-bold text-[#F49D1A]">
                  {appliedVoucher.code}
                </span>
                <p className="text-[10px] text-gray-400">
                  {appliedVoucher.label}
                </p>
              </div>
            </div>
            <span className="font-bold text-[#F49D1A]">
              −{formatIDR(discount)}
            </span>
          </div>
        )}

        <div className="border-t border-gray-100 pt-3 flex justify-between items-end">
          <div>
            <p className="text-sm font-bold text-gray-700">Total Pembayaran</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatIDR(perPax)} / peserta
            </p>
          </div>
          <span className="text-xl font-bold text-gray-900">
            {formatIDR(total)}
          </span>
        </div>
      </div>

      {!hideTerms && (
        <div className="border-t border-gray-100 pt-4 space-y-4">
          {error && (
            <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
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
              className="mt-1 w-4 h-4 rounded border-gray-300 text-[#F49D1A] focus:ring-[#F49D1A]/30 pointer-events-none"
            />
            <span className="text-xs text-gray-500">
              Saya setuju dengan{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalType("terms");
                }}
                className="text-[#F49D1A] font-semibold hover:underline"
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
                className="text-[#F49D1A] font-semibold hover:underline"
              >
                kebijakan privasi
              </button>{" "}
              yang berlaku.
            </span>
          </div>

          <button
            onClick={onNext}
            disabled={!canProceed || !agreeToTerms || isLoading}
            className="w-full bg-[#F49D1A] text-white py-3.5 rounded-xl font-semibold hover:bg-[#c47d12] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
