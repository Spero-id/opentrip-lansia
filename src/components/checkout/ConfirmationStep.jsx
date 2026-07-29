"use client";

import { CheckCircle } from "lucide-react";

export default function ConfirmationStep({ checkout, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Pemesanan Berhasil!
      </h2>
      <p className="text-gray-500 max-w-md mb-8">
        Terima kasih, pesanan kamu sudah tercatat. E-voucher dan panduan perjalanan akan dikirim ke email <span className="font-semibold text-gray-700">{checkout.customer?.email}</span>.
      </p>

      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 w-full max-w-md text-left space-y-4 mb-8">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">ID Pesanan</span>
          <span className="font-bold text-gray-900">{checkout.orderId}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Destinasi</span>
          <span className="font-semibold text-gray-900">{checkout.destination?.title}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Tanggal</span>
          <span className="font-semibold text-gray-900">{checkout.travelDate}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Total Pembayaran</span>
          <span className="font-bold text-[#df7224]">Rp {checkout.total.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Status</span>
          <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">Menunggu Pembayaran</span>
        </div>
      </div>

      <button
        onClick={onReset}
        className="bg-[#df7224] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#c3611c] transition-colors"
      >
        Kembali ke Beranda
      </button>
    </div>
  );
}
