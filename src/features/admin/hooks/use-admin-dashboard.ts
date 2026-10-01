"use client";

import { useEffect, useState } from "react";

export interface DashboardStats {
  totalTrips: number;
  bookingThisMonth: number;
  bookingChange: number | null;
  revenue: string;
  activePromos: number;
}

export interface RecentBooking {
  id: string;
  bookingCode: string;
  status: string;
  totalAmount: string;
  currency: string;
  bookingDate: string;
  customerName: string;
  tripName: string;
}

export function useAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { error?: string; stats?: DashboardStats; recentBookings?: RecentBooking[] };
        if (data.error) throw new Error(data.error);
        if (cancelled) return;
        setStats(data.stats ?? null);
        setRecentBookings(Array.isArray(data.recentBookings) ? data.recentBookings : []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Gagal memuat dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, recentBookings, loading, error };
}
