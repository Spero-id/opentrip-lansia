"use client";

import { Check, X, AlertCircle } from "lucide-react";

export default function ReferralInput({
  referralCode,
  setReferralCode,
  appliedReferral,
  referralError,
  onApply,
  onRemove,
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-bold text-gray-900">Kode Referral</h2>
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold">
          Opsional
        </span>
      </div>

      <p className="text-xs text-gray-400">
        Punya kode referral dari teman? Masukkan di sini untuk mencatat referral.
      </p>

      {appliedReferral ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <div>
              <span className="text-sm font-semibold text-green-700">
                {appliedReferral.code}
              </span>
              <p className="text-[10px] text-green-600">
                Oleh: {appliedReferral.referrerName}
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="text-green-600 hover:text-green-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Masukkan kode referral"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 uppercase"
          />
          <button
            onClick={onApply}
            disabled={!referralCode.trim()}
            className="bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Pakai
          </button>
        </div>
      )}

      {referralError && (
        <div className="flex items-center gap-2 text-xs text-red-500">
          <AlertCircle size={12} />
          {referralError}
        </div>
      )}
    </div>
  );
}
