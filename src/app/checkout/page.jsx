"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCheckout } from "../../lib/hooks/useCheckout";
import { destinationsData } from "../../lib/destinationsData";
import StepProgress from "../../components/checkout/StepProgress";
import DetailsStep from "../../components/checkout/DetailsStep";
import PaymentStep from "../../components/checkout/PaymentStep";

import Footer from "../../components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Subs from "@/components/landing/Subs";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destId = searchParams.get("destination");

  const destination = destId
    ? destinationsData.find((d) => d.id === Number(destId)) ?? null
    : null;

  const checkout = useCheckout(destination);

  useEffect(() => {
    const snapUrl =
      process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
    if (!document.querySelector(`script[src="${snapUrl}"]`)) {
      const script = document.createElement("script");
      script.src = snapUrl;
      script.setAttribute("data-client-key", clientKey);
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 pb-24 sm:pb-20">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {checkout.step === "details" && "Konfirmasi Pemesanan"}
            {checkout.step === "payment" && "Pembayaran"}
            {checkout.step === "confirmation" && "Pemesanan Berhasil 🎉"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {checkout.step === "details" && "Lengkapi detail perjalanan dan data peserta"}
            {checkout.step === "payment" && "Pilih metode pembayaran dan selesaikan transaksi"}
            {checkout.step === "confirmation" && "Terima kasih, perjalanan Anda sudah terkonfirmasi"}
          </p>
        </div>

        {checkout.step !== "confirmation" && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 shadow-sm">
            <StepProgress currentStep={checkout.step} />
          </div>
        )}

        {checkout.step === "details" && (
          <DetailsStep checkout={checkout} onNext={checkout.goToPayment} />
        )}
        {checkout.step === "payment" && (
          <PaymentStep checkout={checkout} onPay={checkout.initiatePayment} onBack={checkout.goBack} />
        )}
        {checkout.step === "confirmation" && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">Pembayaran Berhasil!</p>
            <p className="text-sm text-gray-500 mb-1">Terima kasih, perjalanan Anda sudah terkonfirmasi</p>
            {checkout.orderId && (
              <p className="text-xs text-gray-400 mb-8">
                Kode Booking: <span className="font-mono font-bold text-[#df7224]">{checkout.orderId}</span>
              </p>
            )}
            {!checkout.orderId && <p className="text-xs text-gray-400 mb-8">&nbsp;</p>}
            <button
              onClick={() => router.push("/")}
              className="bg-[#df7224] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#c3611c] transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
        )}
      </main>
      <Subs />
      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-[#df7224] animate-spin" />
            <p className="text-sm font-semibold text-gray-500">Memuat halaman checkout...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
