import { useEffect, useState } from "react";
import { toPublicError } from "@/utils/errors/to-public-error";
import { fetchReferralHistory } from "@/features/profile";
import { DEFAULT_HISTORY_LIMIT } from "@/features/profile";
import type { ReferralHistoryItem, ReferralPagination } from "@/features/profile";

export function useReferralHistory(page: number, limit = DEFAULT_HISTORY_LIMIT) {
  const [history, setHistory] = useState<ReferralHistoryItem[]>([]);
  const [pagination, setPagination] = useState<ReferralPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const { history: items, pagination: paging } = await fetchReferralHistory(page, limit);
        if (!cancelled) {
          setHistory(items);
          setPagination(paging);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(toPublicError(err));
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [page, limit]);

  return { history, pagination, loading, error };
}
