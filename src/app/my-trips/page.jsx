"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EmptyState from "@/components/my-trips/EmptyState";
import OpenTripBookingCard from "@/components/my-trips/OpenTripBookingCard";
import RequestCard from "@/components/my-trips/RequestCard";

export default function MyTripsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [tab, setTab] = useState("open");
  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.push("/login?redirect=/my-trips");
      return;
    }
    fetchData();
  }, [session, isPending]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, requestsRes] = await Promise.all([
        fetch("/api/bookings").then((r) => r.json()),
        fetch("/api/private-trips").then((r) => r.json()),
      ]);
      setBookings(Array.isArray(bookingsRes) ? bookingsRes : bookingsRes?.rows || []);
      setRequests(Array.isArray(requestsRes) ? requestsRes : requestsRes?.rows || []);
    } catch (err) {
      console.error("Gagal memuat data:", err);
    }
    setLoading(false);
  };

  if (isPending || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#F49D1A]/30 border-t-[#F49D1A] rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-400">Memuat data perjalanan...</p>
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
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <Navbar />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Perjalanan Saya</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola booking open trip dan private trip Anda</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          <button
            onClick={() => { setTab("open"); setFilter("all"); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === "open" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Open Trip ({bookings.length})
          </button>
          <button
            onClick={() => { setTab("private"); setFilter("all"); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === "private" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Private Trip ({requests.length})
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 flex-wrap mb-6">
          {activeFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                filter === f.value
                  ? "bg-[#F49D1A] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[#F49D1A]/50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "open" ? (
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <EmptyState type="open" />
            ) : (
              filteredBookings.map((b) => <OpenTripBookingCard key={b.id} booking={b} />)
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <EmptyState type="private" />
            ) : (
              filteredRequests.map((r) => <RequestCard key={r.id} req={r} onRefresh={fetchData} />)
            )}
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
