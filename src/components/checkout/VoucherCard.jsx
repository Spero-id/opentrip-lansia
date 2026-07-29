"use client";

import { Check, X } from "lucide-react";

export default function VoucherCard({ voucherCode, setVoucherCode, appliedVoucher, voucherError, onApply, onRemove }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3 shadow-sm">
      <h2 className="text-base font-bold text-gray-900">Voucher / Kode Promo</h2>
      {appliedVoucher ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-800">{appliedVoucher.label}</span>
          </div>
          <button onClick={onRemove} className="text-green-600 hover:text-green-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Masukkan kode voucher"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#df7224]/20"
          />
          <button
            onClick={onApply}
            className="bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Pakai
          </button>
        </div>
      )}
      {voucherError && <p className="text-xs text-red-500">{voucherError}</p>}
    </div>
  );
}
