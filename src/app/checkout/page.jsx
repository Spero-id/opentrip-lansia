"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
  const bookingId = searchParams.get("booking");
  const initialized = useRef(false);

  const staticDest = destId
    ? destinationsData.find((d) => d.id === Number(destId)) ?? null
    : null;

  const checkout = useCheckout(staticDest);

  const [status, setStatus] = useState(
    staticDest ? "found" : destId ? "loading" : "empty"
  );

  // Single initialization effect
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      // If booking param exists, fetch booking
      if (bookingId) {
        try {
          const res = await fetch(`/api/bookings/${bookingId}`);
          if (!res.ok) throw new Error("Booking tidak ditemukan");
          const data = await res.json();

          // Parse notes
          let notesObj = {};
          if (data.notes) {
            try {
              notesObj = typeof data.notes === "string" ? JSON.parse(data.notes) : data.notes;
            } catch {}
          }

          // Fetch trips to find the trip image for this departure
          let tripImage = null;
          try {
            const tripsRes = await fetch("/api/trips");
            const tripsData = await tripsRes.json();
            if (Array.isArray(tripsData)) {
              const matchingTrip = tripsData.find(
                (t) => t.id === notesObj.destinationId || t.departures?.some((dep) => dep.id === data.departureId)
              );
              if (matchingTrip) {
                tripImage = matchingTrip.image || matchingTrip.images?.[0] || null;
              }
            }
          } catch {}

          // Set destination
          const dest = {
            id: notesObj.destinationId || data.departureId,
            title: notesObj.destinationName || "Paket Open Trip",
            priceMin: Math.round(Number(data.subtotal) / data.totalParticipants),
            departureId: data.departureId,
            image: tripImage || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQw8p4vVW46w8v2EDTYS5ZN08gcBlEyL2Hq2n-oDk588w&s=10",
          };
          checkout.setDestination(dest);

          // Set pax
          checkout.setPax(data.totalParticipants);

          // Set customer from participant
          const primary = data.participants?.find(p => p.isPrimary) || data.participants?.[0];
          if (primary) {
            const hc = data.healthDeclarations?.[0] || {};
            checkout.setCustomer("fullName", primary.fullName || "");
            checkout.setCustomer("birthDate", primary.dateOfBirth || "");
            checkout.setCustomer("phone", primary.phone || "");
            checkout.setCustomer("address", primary.address || "");
            checkout.setCustomer("emergencyContactName", primary.emergencyContactName || "");
            checkout.setCustomer("emergencyContactPhone", primary.emergencyContactPhone || "");
            checkout.setCustomer("healthConditions", {
              hypertension: hc.hasHypertension || false,
              diabetes: hc.hasDiabetes || false,
              heart: hc.hasHeartDisease || false,
              asthma: hc.hasAsthma || false,
              vertigo: hc.hasVertigo || false,
              jointBone: hc.hasJointBoneDisease || false,
              none: hc.noConditions || false,
            });
            checkout.setCustomer("medications", hc.medications || "");
            checkout.setCustomer("mobilityOption", hc.mobilityOption || "independent");
          }

          // Store bookingId for payment update
          checkout.setCustomer("_bookingId", bookingId);

          setStatus("found");
        } catch (err) {
          console.error("Gagal memuat booking:", err);
          setStatus("notfound");
        }
      }
      // If destination param exists but not static, fetch from API
      else if (destId && !staticDest) {
        try {
          const res = await fetch("/api/trips");
          const data = await res.json();
          const found = Array.isArray(data)
            ? data.find((d) => d.id === destId && d.status === "published")
            : undefined;
          if (found) {
            // Import toDetail dynamically
            const { toDetail } = await import("../../lib/Destination");
            checkout.setDestination(toDetail(found));
            setStatus("found");
          } else {
            setStatus("notfound");
          }
        } catch {
          setStatus("notfound");
        }
      }
    };

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load Midtrans script
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

  const isExistingBooking = !!bookingId;

  // Custom pay handler for existing bookings
  const handlePayExisting = async (paymentProofFile) => {
    const bookingIdVal = checkout.customer?._bookingId;
    if (!bookingIdVal || !paymentProofFile) return;

    try {
      const formData = new FormData();
      formData.append("bookingId", bookingIdVal);
      formData.append("paymentMethod", checkout.paymentMethod || "manual");
      formData.append("totalAmount", String(checkout.total));
      formData.append("paymentProof", paymentProofFile);

      const res = await fetch("/api/payment", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let message = "Gagal memproses pembayaran.";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {}
        alert(message);
        return;
      }

      router.push("/my-trips");
    } catch (err) {
      console.error("Payment error:", err);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  // For existing bookings, skip directly to payment
  const currentStep = isExistingBooking ? "payment" : checkout.step;

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 pb-24 sm:pb-20">
        {status !== "found" && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            {status === "loading" && (
              <p className="text-sm text-gray-400">Memuat data...</p>
            )}
            {status === "empty" && (
              <>
                <p className="text-sm text-gray-500 font-semibold mb-1">
                  Belum ada destinasi dipilih.
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Silakan pilih destinasi terlebih dahulu.
                </p>
                <Link
                  href="/trips"
                  className="text-sm font-semibold text-[#F49D1A] hover:underline"
                >
                  Lihat destinasi
                </Link>
              </>
            )}
            {status === "notfound" && (
              <>
                <p className="text-sm text-gray-500 font-semibold mb-1">
                  Data tidak ditemukan.
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Booking atau destinasi sudah tidak tersedia.
                </p>
                <Link
                  href="/my-trips"
                  className="text-sm font-semibold text-[#F49D1A] hover:underline"
                >
                  Kembali ke Perjalanan Saya
                </Link>
              </>
            )}
          </div>
        )}

        {status === "found" && (
          <>
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {currentStep === "details" && "Konfirmasi Pemesanan"}
                {currentStep === "payment" && "Pembayaran"}
                {currentStep === "confirmation" && "Pemesanan Berhasil"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {currentStep === "details" && "Lengkapi detail perjalanan dan data peserta"}
                {currentStep === "payment" && "Pilih metode pembayaran dan selesaikan transaksi"}
                {currentStep === "confirmation" && "Terima kasih, perjalanan Anda sudah terkonfirmasi"}
              </p>
            </div>

            {currentStep !== "confirmation" && (
              <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 shadow-sm">
                <StepProgress currentStep={currentStep} />
              </div>
            )}

            {currentStep === "details" && (
              <DetailsStep checkout={checkout} onNext={checkout.goToPayment} />
            )}
            {currentStep === "payment" && (
              <PaymentStep
                checkout={checkout}
                onPay={isExistingBooking ? handlePayExisting : checkout.initiatePayment}
                onBack={isExistingBooking ? () => router.push("/my-trips") : checkout.goBack}
              />
            )}
            {currentStep === "confirmation" && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-[#1CA6B7]/15 flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-[#1CA6B7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-2">Pembayaran Berhasil!</p>
                <p className="text-sm text-gray-500 mb-1">Terima kasih, perjalanan Anda sudah terkonfirmasi</p>
                {checkout.orderId && (
                  <p className="text-xs text-gray-400 mb-8">
                    Kode Booking: <span className="font-mono font-bold text-[#F49D1A]">{checkout.orderId}</span>
                  </p>
                )}
                {!checkout.orderId && <p className="text-xs text-gray-400 mb-8">&nbsp;</p>}
                <button
                  onClick={() => router.push("/my-trips")}
                  className="bg-[#F49D1A] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#c47d12] transition-colors"
                >
                  Lihat Perjalanan Saya
                </button>
              </div>
            )}
          </>
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
        <div className="flex flex-col min-h-screen bg-white items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#F49D1A]/30 border-t-[#F49D1A] rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
