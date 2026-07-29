"use client";

import BookingSummary from "./BookingSummary";
import PriceBreakdown from "./PriceBreakdown";

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
            className="flex-1 bg-[#df7224] text-white py-3 rounded-xl font-semibold hover:bg-[#c3611c] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          pax={checkout.pax}
          ticketSubtotal={checkout.ticketSubtotal}
          meetingPointFee={checkout.meetingPointFee}
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
    { id: "bca", label: "BCA Virtual Account", icon: "🏦" },
    { id: "bri", label: "BRI Virtual Account", icon: "🏦" },
    { id: "mandiri", label: "Mandiri Virtual Account", icon: "🏦" },
    { id: "gopay", label: "GoPay", icon: "💚" },
    { id: "ovo", label: "OVO", icon: "💜" },
    { id: "dana", label: "DANA", icon: "💙" },
    { id: "qris", label: "QRIS", icon: "📱" },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3 shadow-sm">
      <h2 className="text-base font-bold text-gray-900">Metode Pembayaran</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {methods.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all ${
              method === m.id
                ? "border-[#df7224] bg-[#df7224]/5 text-[#df7224]"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            <span className="text-lg">{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
