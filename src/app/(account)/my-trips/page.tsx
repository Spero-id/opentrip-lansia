"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/client";
import {
  EmptyState,
  OpenTripBookingCard,
  RequestCard,
  fetchPrivateRequests,
  normalizeList,
  useOpenTripBooking,
} from "@/features/my-trips";
import type { BookingNotes, MyTripBooking, PrivateTripRequest } from "@/features/my-trips";

export default function MyTripsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [tab, setTab] = useState("open");
  const {
    bookings,
    tripImages,
    loading: bookingsLoading,
    refresh: refreshBookings,
  } = useOpenTripBooking();
  const [requests, setRequests] = useState<PrivateTripRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const loading = bookingsLoading || requestsLoading;
  const [filter, setFilter] = useState("all");

  const getDestinationId = (booking: MyTripBooking): string | null => {
    if (!booking?.notes) return null;
    try {
      const notes = typeof booking.notes === "string" ? (JSON.parse(booking.notes) as BookingNotes) : booking.notes;
      return notes?.destinationId || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.push("/login?redirect=/my-trips");
      return;
    }
    let cancelled = false;
    fetchPrivateRequests()
      .then((payload) => {
        if (cancelled) return;
        setRequests(normalizeList<PrivateTripRequest>(payload));
        setRequestsLoading(false);
      })
      .catch(() => {
        if (!cancelled) setRequestsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session, isPending, router]);

  const refreshAll = () => {
    void refreshBookings();
    setRequestsLoading(true);
    fetchPrivateRequests()
      .then((payload) => {
        setRequests(normalizeList<PrivateTripRequest>(payload));
        setRequestsLoading(false);
      })
      .catch(() => setRequestsLoading(false));
  };

  if (isPending || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Memuat data perjalanan...</p>
          </div>
        </main>
      </div>
    );
  }

  const filteredBookings = bookings.filter((b) => filter === "all" || b.status === filter);
  const filteredRequests = requests.filter((r) => filter === "all" || r.status === filter);

  const openFilters = [
    { value: "all", label: "Semua" },
    { value: "pending_payment", label: "Menunggu Bayar" },
    { value: "confirmed", label: "Terkonfirmasi" },
    { value: "completed", label: "Selesai" },
  ];

  const privateFilters = [
    { value: "all", label: "Semua" },
    { value: "submitted", label: "Menunggu Direview" },
    { value: "reviewed", label: "Sedang Direview" },
    { value: "rejected", label: "Ditolak" },
  ];

  const activeFilters = tab === "open" ? openFilters : privateFilters;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Perjalanan Saya</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola booking open trip dan private trip Anda</p>
        </div>

        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6 w-fit">
          <button
            onClick={() => { setTab("open"); setFilter("all"); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === "open" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Open Trip ({bookings.length})
          </button>
          <button
            onClick={() => { setTab("private"); setFilter("all"); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === "private" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Private Trip ({requests.length})
          </button>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {activeFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border border-border hover:border-primary/50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {tab === "open" ? (
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <EmptyState type="open" />
            ) : (
              filteredBookings.map((b) => (
                <OpenTripBookingCard
                  key={b.id}
                  booking={b}
                  imageUrl={tripImages[getDestinationId(b) ?? ""] || null}
                  onRefresh={refreshAll}
                />
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <EmptyState type="private" />
            ) : (
              filteredRequests.map((r) => <RequestCard key={r.id} req={r} onRefresh={refreshAll} />)
            )}
          </div>
        )}

      </main>
    </div>
  );
}
