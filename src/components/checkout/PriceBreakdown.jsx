"use client";

import { useState } from "react";
import TermsModal from "./TermsModal";

export default function PriceBreakdown({ destination, pax, ticketSubtotal, meetingPointFee, serviceFee, discount, total, appliedVoucher, agreeToTerms, setAgreeToTerms, canProceed, onNext, hideTerms }) {
  const [modalType, setModalType] = useState(null);

  const handleAgree = () => {
    setAgreeToTerms(true);
    setModalType(null);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3 sticky top-24">
      <h2 className="text-base font-bold text-gray-900">Ringkasan Harga</h2>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Paket {destination?.title}</span>
          <span className="font-semibold text-gray-900">Rp {ticketSubtotal.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Jumlah Peserta</span>
          <span className="font-semibold text-gray-900">{pax} orang</span>
        </div>
        {meetingPointFee > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">Biaya Meeting Point</span>
            <span className="font-semibold text-gray-900">Rp {meetingPointFee.toLocaleString("id-ID")}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">Biaya Layanan</span>
          <span className="font-semibold text-gray-900">Rp {serviceFee.toLocaleString("id-ID")}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-[#1CA6B7]">
            <span>Diskon {appliedVoucher?.label}</span>
            <span className="font-semibold">-Rp {discount.toLocaleString("id-ID")}</span>
          </div>
        )}
      </div>
      <div className="border-t border-gray-100 pt-3 flex justify-between">
        <span className="font-bold text-gray-900">Total</span>
        <span className="font-extrabold text-[#F49D1A] text-lg">Rp {total.toLocaleString("id-ID")}</span>
      </div>

      {!hideTerms && (
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <div className="flex items-start gap-3 cursor-pointer" onClick={() => setModalType("terms")}>
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
                onClick={(e) => { e.stopPropagation(); setModalType("terms"); }}
                className="text-[#F49D1A] font-semibold hover:underline"
              >
                syarat & ketentuan
              </button>{" "}
              serta{" "}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setModalType("privacy"); }}
                className="text-[#F49D1A] font-semibold hover:underline"
              >
                kebijakan privasi
              </button>{" "}
              yang berlaku.
            </span>
          </div>

          <button
            onClick={onNext}
            disabled={!canProceed || !agreeToTerms}
            className="w-full bg-[#F49D1A] text-white py-3.5 rounded-xl font-semibold hover:bg-[#c47d12] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Lanjut ke Pembayaran
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
