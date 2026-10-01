import { useEffect, useState } from "react";
import { toPublicError } from "@/lib/errors/to-public-error";
import { fetchReferralSummary } from "@/features/profile";
import type { ReferralSummary } from "@/features/profile";

export function useProfileStats() {
  const [data, setData] = useState<ReferralSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchReferralSummary()
      .then((summary) => {
        if (!cancelled) {
          setData(summary);
          setLoading(false);
        }
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

  return { data, loading, error };
}
