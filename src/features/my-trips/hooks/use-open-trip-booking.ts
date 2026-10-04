import { useCallback, useEffect, useState } from "react";
import { toPublicError } from "@/utils/errors/to-public-error";
import { buildTripImages, fetchMyBookings, fetchTrips, normalizeList } from "@/features/my-trips";
import type { MyTripBooking } from "@/features/my-trips";

export function useOpenTripBooking() {
  const [bookings, setBookings] = useState<MyTripBooking[]>([]);
  const [tripImages, setTripImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingsRes, tripsRes] = await Promise.all([fetchMyBookings(), fetchTrips()]);
      setBookings(normalizeList<MyTripBooking>(bookingsRes));
      setTripImages(buildTripImages(tripsRes));
    } catch (err: unknown) {
      setError(toPublicError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchMyBookings(), fetchTrips()])
      .then(([bookingsRes, tripsRes]) => {
        if (cancelled) return;
        setBookings(normalizeList<MyTripBooking>(bookingsRes));
        setTripImages(buildTripImages(tripsRes));
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(toPublicError(err));
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { bookings, tripImages, loading, error, refresh };
}
