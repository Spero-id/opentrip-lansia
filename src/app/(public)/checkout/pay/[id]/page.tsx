"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { PaymentStep } from "@/features/checkout";
import { useCheckout } from "@/features/checkout";

interface PayParticipant {
  fullName?: string | null;
  dateOfBirth?: string | null;
  phone?: string | null;
  address?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  isPrimary?: boolean | null;
}

interface PayHealthDeclaration {
  hasHypertension?: boolean | null;
  hasDiabetes?: boolean | null;
  hasHeartDisease?: boolean | null;
  hasAsthma?: boolean | null;
  hasVertigo?: boolean | null;
  hasJointBoneDisease?: boolean | null;
  noConditions?: boolean | null;
  medications?: string | null;
  mobilityOption?: string | null;
}

interface PayBooking {
  id?: string | null;
  departureId?: string | null;
  subtotal?: number | string | null;
  totalParticipants: number;
  totalAmount?: number | string | null;
  discountAmount?: number | string | null;
  notes?: string | Record<string, string | undefined> | null;
  participants?: PayParticipant[] | null;
  healthDeclarations?: PayHealthDeclaration[] | null;
}

function PayContent() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id;

  const [booking, setBooking] = useState<PayBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkout = useCheckout(null);

  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (!res.ok) {
          throw new Error("Booking tidak ditemukan");
        }
        const data: PayBooking = await res.json();

        let notesObj: Record<string, string | undefined> = {};
        if (data.notes) {
          try {
            notesObj = typeof data.notes === "string" ? JSON.parse(data.notes) : data.notes;
          } catch {
            notesObj = {};
          }
        }

        const destination = {
          id: notesObj.destinationId || data.departureId,
          image: "",
          title: notesObj.destinationName || "Paket Open Trip",
          priceMin: Math.round(Number(data.subtotal) / Number(data.totalParticipants)),
        };

        checkout.setDestination(destination);
        checkout.setPax(data.totalParticipants);

        const participants: PayParticipant[] = data.participants ?? [];
        const primaryParticipant = participants.find((p) => p.isPrimary) || participants[0];
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

          Object.entries(customer).forEach(([field, value]) => {
            checkout.setCustomer(field, value);
          });
        }

        setBooking(data);
        setLoading(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Booking tidak ditemukan");
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  useEffect(() => {
    if (booking) {
      checkout.setCustomer("_bookingId", booking.id);
    }
  }, [booking]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Memuat detail booking...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-sm text-destructive-500 font-semibold">{error}</p>
            <Link href="/my-trips" className="text-sm text-primary-foreground font-semibold hover:underline">
              Kembali ke Perjalanan Saya
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const handlePay = async () => {
    if (!booking || !checkout.proofUrl) {
      alert("Silakan unggah bukti transfer terlebih dahulu.");
      return;
    }

    checkout.setCustomer("_isLoading", true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          paymentMethod: checkout.paymentMethod || "manual",
          proofUrl: checkout.proofUrl,
        }),
      });

      if (!res.ok) {
        let message = "Gagal memproses pembayaran. Silakan coba lagi.";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {}

        alert(message);
        return;
      }

      router.push("/my-trips");
    } catch {
      alert("Terjadi kesalahan jaringan. Silakan coba lagi.");
    }
  };

  const checkoutWithData = {
    ...checkout,
    destination: {
      id: booking?.departureId,
      image: "",
      title: (() => {
        try {
          const notes = JSON.parse(String(booking?.notes || "{}"));
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
    discount: Number(booking?.discountAmount || 0),
    isLoading: false,
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans text-foreground">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 pb-24 sm:pb-20">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Pembayaran</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pilih metode pembayaran dan unggah bukti transfer
          </p>
        </div>

        <PaymentStep
          checkout={checkoutWithData}
          onPay={handlePay}
          onBack={() => router.push("/my-trips")}
        />
      </main>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-background items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <PayContent />
    </Suspense>
  );
}
