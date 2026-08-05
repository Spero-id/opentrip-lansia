"use client";

import BookingSummary from "./BookingSummary";
import PriceBreakdown from "./PriceBreakdown";
import Image from "next/image";


export default function PaymentStep({ checkout, onPay, onBack }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
      <div className="lg:col-span-3 space-y-6">
        <BookingSummary destination={checkout.destination} />
        <PaymentSelector method={checkout.paymentMethod} onChange={checkout.setPaymentMethod} />

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
            onClick={onPay}
            disabled={!checkout.paymentMethod || checkout.isLoading}
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

function PaymentSelector({ method, onChange }) {
  const methods = [
    { id: "bri", alt: "BRI", icon: "/logo-BRI.png" },
    { id: "mandiri", alt: "Mandiri", icon: "/logo-Mandiri.png" },
    { id: "gopay", alt: "GoPay", icon: "/logo-Gopay.png" },
    { id: "ovo", alt: "OVO", icon: "/logo-Ovo.jpg" },
    { id: "dana", alt: "DANA", icon: "/logo-Dana.webp" },
    { id: "qris", alt: "QRIS", icon: "/logo-Qris-2.png" },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
      <div>
        <h2 className="text-base font-bold text-gray-900">Metode Pembayaran</h2>
        <p className="text-xs text-gray-400 mt-0.5">Pilih metode pembayaran yang kamu inginkan.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {methods.map((m) => {
          const active = method === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onChange(m.id)}
              className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                active
                  ? "border-[#F49D1A] bg-[#F49D1A]/5 ring-2 ring-[#F49D1A]/20"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="w-full h-9 flex items-center justify-center">
                <Image src={m.icon} alt={m.alt} width={62} height={62} className="object-contain max-h-9" />
              </div>
              <span className={`text-xs font-semibold ${active ? "text-[#F49D1A]" : "text-gray-600"}`}>
                {m.alt}
              </span>
              {active && (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#F49D1A] flex items-center justify-center">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
