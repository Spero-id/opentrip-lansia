"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCheckout } from "@/features/checkout";
import {
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
  NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION,
} from "@/lib/env/client";
import { DetailsStep, PaymentStep, StepProgress } from "@/features/checkout";

import Subs from "@/features/newsletter/components/Subs";
import { toDetail } from "@/features/trip/trip-mapper";
import type { DestinationSummary } from "@/features/checkout";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destId = searchParams.get("destination");

  const checkout = useCheckout(null);
  const setDestination = checkout.setDestination;

  const [status, setStatus] = useState<"loading" | "empty" | "found" | "notfound">(destId ? "loading" : "empty");

  useEffect(() => {
    if (!destId) return;
    let cancelled = false;

    fetch("/api/trips")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const found = Array.isArray(data)
          ? data.find((d) => d.id === destId && d.status === "published")
          : undefined;
        if (found) {
          setDestination(toDetail(found) as unknown as DestinationSummary);
          setStatus("found");
        } else {
          setStatus("notfound");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("notfound");
      });

    return () => {
      cancelled = true;
    };
  }, [destId, setDestination]);

  useEffect(() => {
    const snapUrl = NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    if (!document.querySelector(`script[src="${snapUrl}"]`)) {
      const script = document.createElement("script");
      script.src = snapUrl;
      script.setAttribute("data-client-key", clientKey);
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans text-foreground">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 pb-24 sm:pb-20">
        {status !== "found" && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            {status === "loading" && (
              <p className="text-sm text-muted-foreground">Memuat destinasi...</p>
            )}
            {status === "empty" && (
              <>
                <p className="text-sm text-muted-foreground font-semibold mb-1">
                  Belum ada destinasi dipilih.
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Silakan pilih destinasi terlebih dahulu.
                </p>
                <Link
                  href="/trips"
                  className="text-sm font-semibold text-primary-foreground hover:underline"
                >
                  Lihat destinasi
                </Link>
              </>
            )}
            {status === "notfound" && (
              <>
                <p className="text-sm text-muted-foreground font-semibold mb-1">
                  Destinasi tidak ditemukan.
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Data destinasi sudah tidak tersedia atau dihapus.
                </p>
                <Link
                  href="/trips"
                  className="text-sm font-semibold text-primary-foreground hover:underline"
                >
                  Lihat destinasi lain
                </Link>
              </>
            )}
          </div>
        )}

        {status === "found" && (
          <>
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {checkout.step === "details" && "Konfirmasi Pemesanan"}
                {checkout.step === "payment" && "Pembayaran"}
                {checkout.step === "confirmation" && "Menunggu Verifikasi"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {checkout.step === "details" && "Lengkapi detail perjalanan dan data peserta"}
                {checkout.step === "payment" && "Pilih metode pembayaran dan unggah bukti transfer"}
                {checkout.step === "confirmation" && "Bukti transfer Anda sedang diverifikasi admin"}
              </p>
            </div>

            {checkout.step !== "confirmation" && (
              <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 shadow-sm">
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
              <div className="w-full max-w-md mx-auto py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-secondary/15 flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-10 h-10 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-foreground mb-2">Bukti Pembayaran Terkirim!</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Bukti transfer Anda telah <strong className="text-foreground">tersimpan di akun</strong> dan sedang menunggu verifikasi admin.
                  Seperti aplikasi KAI/tiket lain, bukti booking Anda bisa dilihat kapan saja di halaman <strong className="text-foreground">Perjalanan Saya</strong>.
                </p>

                {checkout.proofUrl && (
                  <div className="mb-6 p-3 bg-muted rounded-xl border border-border">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Pratinjau Bukti Transfer</p>
                    <a
                      href={checkout.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={checkout.proofUrl}
                        alt="Bukti transfer"
                        className="w-full max-h-48 object-contain bg-card rounded-lg border border-border mx-auto"
                      />
                    </a>
                    <p className="text-[10px] text-muted-foreground mt-1">Klik untuk perbesar</p>
                  </div>
                )}

                {checkout.orderId && (
                  <p className="text-xs text-muted-foreground mb-6">
                    Kode Booking: <span className="font-mono font-bold text-primary-foreground">{checkout.orderId}</span>
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/my-trips"
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Lihat di Perjalanan Saya
                  </Link>
                  <button
                    onClick={() => router.push("/")}
                    className="px-6 py-3 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    Kembali ke Beranda
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Subs />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-sm font-semibold text-muted-foreground">Memuat halaman checkout...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
