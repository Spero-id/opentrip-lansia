"use client";

import { useState, useRef } from "react";
import BookingSummary from "./BookingSummary";
import PriceBreakdown from "./PriceBreakdown";

const BANK_INFO = {
  name: "Bank BRI",
  accountNumber: "1234 5678 9012 3456",
  accountName: "PT Jelajah Memoria",
};

export default function PaymentStep({ checkout, onPay, onBack }) {
  const [paymentProof, setPaymentProof] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentProof(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    setPaymentProof(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBayar = () => {
    onPay(paymentProof);
  };

const canPay = paymentProof && !checkout.isLoading;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
      <div className="lg:col-span-3 space-y-6">
        <BookingSummary destination={checkout.destination} />

        {/* Bank Account Info */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-gray-900">Transfer ke Rekening</h2>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">BRI</span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{BANK_INFO.name}</p>
                <p className="text-xs text-gray-500">Transfer ke rekening ini</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-gray-500 mb-1">Nomor Rekening</p>
              <p className="text-lg font-mono font-bold text-gray-900 tracking-wider">
                {BANK_INFO.accountNumber}
              </p>
              <p className="text-xs text-gray-500 mt-1">a.n. {BANK_INFO.accountName}</p>
            </div>
          </div>
        </div>

        {/* Payment Proof Upload */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-gray-900">Upload Bukti Pembayaran</h2>
          <p className="text-xs text-gray-400">
            Upload bukti transfer/screenshot pembayaran Anda
          </p>

          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Bukti pembayaran"
                className="w-full max-h-64 object-contain rounded-xl border border-gray-200"
              />
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#F49D1A] hover:bg-orange-50/30 transition-colors">
              <div className="flex flex-col items-center gap-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="text-sm text-gray-500">Klik untuk upload foto</span>
                <span className="text-xs text-gray-400">JPG, PNG, maks 5MB</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {checkout.error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {checkout.error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Kembali
          </button>
          <button
            onClick={handleBayar}
            disabled={!canPay}
            className="flex-1 bg-[#F49D1A] text-white py-3 rounded-xl font-semibold hover:bg-[#c47d12] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {checkout.isLoading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Memproses...
              </>
            ) : (
              `Bayar Rp ${checkout.total.toLocaleString("id-ID")}`
            )}
          </button>
        </div>
      </div>

      <div className="lg:col-span-2">
        <PriceBreakdown
          destination={checkout.destination}
          pricePerPax={checkout.destination?.priceMin ?? 0}
          pax={checkout.pax}
          ticketSubtotal={checkout.ticketSubtotal}
          serviceFee={checkout.serviceFee}
          discount={checkout.discount}
          total={checkout.total}
          appliedVoucher={checkout.appliedVoucher}
          hideTerms
        />
      </div>
    </div>
  );
}
