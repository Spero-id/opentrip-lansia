"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PaymentStep from "@/components/checkout/PaymentStep";
import { useCheckout } from "@/lib/hooks/useCheckout";

function PayContent() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkout = useCheckout(null);

  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (!res.ok) {
          throw new Error("Booking tidak ditemukan");
        }
        const data = await res.json();

        // Parse notes for destination info
        let notesObj = {};
        if (data.notes) {
          try {
            notesObj = typeof data.notes === "string" ? JSON.parse(data.notes) : data.notes;
          } catch {
            notesObj = {};
          }
        }

        // Set booking data into checkout state
        const destination = {
          id: notesObj.destinationId || data.departureId,
          title: notesObj.destinationName || "Paket Open Trip",
          priceMin: Math.round(Number(data.subtotal) / data.totalParticipants),
        };

        // Set the booking info into checkout
        checkout.setDestination(destination);
        checkout.setPax(data.totalParticipants);

        // Set customer info from participants
        const primaryParticipant = data.participants?.find(p => p.isPrimary) || data.participants?.[0];
        if (primaryParticipant) {
          const customer = {
            fullName: primaryParticipant.fullName || "",
            birthDate: primaryParticipant.dateOfBirth || "",
            phone: primaryParticipant.phone || "",
            address: primaryParticipant.address || "",
            emergencyContactName: primaryParticipant.emergencyContactName || "",
            emergencyContactPhone: primaryParticipant.emergencyContactPhone || "",
            healthConditions: data.healthDeclarations?.[0] ? {
              hypertension: data.healthDeclarations[0].hasHypertension || false,
              diabetes: data.healthDeclarations[0].hasDiabetes || false,
              heart: data.healthDeclarations[0].hasHeartDisease || false,
              asthma: data.healthDeclarations[0].hasAsthma || false,
              vertigo: data.healthDeclarations[0].hasVertigo || false,
              jointBone: data.healthDeclarations[0].hasJointBoneDisease || false,
              none: data.healthDeclarations[0].noConditions || false,
            } : {
              hypertension: false, diabetes: false, heart: false,
              asthma: false, vertigo: false, jointBone: false, none: false,
            },
            medications: data.healthDeclarations?.[0]?.medications || "",
            mobilityOption: data.healthDeclarations?.[0]?.mobilityOption || "independent",
          };

          // Manually set customer fields
          Object.entries(customer).forEach(([field, value]) => {
            checkout.setCustomer(field, value);
          });
        }

        // Set order info
        // We need to set the internal state directly for bookingId
        // This is a workaround since the hook doesn't expose a direct setter
        setBooking(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  // Override initiatePayment to use bookingId from API
  useEffect(() => {
    if (booking) {
      // Store bookingId in a way the payment can use
      checkout.setCustomer("_bookingId", booking.id);
    }
  }, [booking]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#F49D1A]/30 border-t-[#F49D1A] rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-400">Memuat detail booking...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-sm text-red-500 font-semibold">{error}</p>
            <Link href="/my-trips" className="text-sm text-[#F49D1A] font-semibold hover:underline">
              Kembali ke Perjalanan Saya
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Custom initiatePayment that uses bookingId from the fetched booking
  const handlePay = async (paymentProofFile) => {
    if (!booking || !paymentProofFile) return;

    checkout.setCustomer("_isLoading", true);

    try {
      const formData = new FormData();
      formData.append("bookingId", booking.id);
      formData.append("paymentMethod", checkout.paymentMethod || "manual");
      formData.append("totalAmount", booking.totalAmount);
      if (paymentProofFile) {
        formData.append("paymentProof", paymentProofFile);
      }

      const res = await fetch("/api/payment", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let message = "Gagal memproses pembayaran. Silakan coba lagi.";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {}

        // Set error via a workaround
        alert(message);
        return;
      }

      // Redirect to success page
      router.push("/my-trips");
    } catch (err) {
      console.error("Gagal memproses pembayaran:", err);
      alert("Terjadi kesalahan jaringan. Silakan coba lagi.");
    }
  };

  // Create a mock checkout object with the booking data
  const checkoutWithData = {
    ...checkout,
    destination: {
      id: booking?.departureId,
      title: (() => {
        try {
          const notes = JSON.parse(booking?.notes || "{}");
          return notes.destinationName || "Paket Open Trip";
        } catch {
          return "Paket Open Trip";
        }
      })(),
      priceMin: Math.round(Number(booking?.subtotal || 0) / (booking?.totalParticipants || 1)),
    },
    pax: booking?.totalParticipants || 1,
    total: Number(booking?.totalAmount || 0),
    ticketSubtotal: Number(booking?.subtotal || 0),
    serviceFee: 15000,
    discount: Number(booking?.discountAmount || 0),
    isLoading: false,
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 pb-24 sm:pb-20">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pembayaran</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pilih metode pembayaran dan unggah bukti transfer
          </p>
        </div>

        <PaymentStep
          checkout={checkoutWithData}
          onPay={handlePay}
          onBack={() => router.push("/my-trips")}
        />
      </main>
      <Footer />
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-white items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#F49D1A]/30 border-t-[#F49D1A] rounded-full animate-spin" />
        </div>
      }
    >
      <PayContent />
    </Suspense>
  );
}
