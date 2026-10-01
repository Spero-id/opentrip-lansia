import { toPublicError } from "@/lib/errors/to-public-error";
import type {
  ReferralHistoryItem,
  ReferralPagination,
  ReferralSummary,
} from "@/features/profile";

export const DEFAULT_HISTORY_LIMIT = 10;

export async function fetchReferralSummary(): Promise<ReferralSummary> {
  let res: Response;
  try {
    res = await fetch("/api/user/referral");
  } catch (err) {
    throw new Error(toPublicError(err));
  }
  if (!res.ok) throw new Error(`Referral summary request failed: ${res.status}`);
  return (await res.json()) as ReferralSummary;
}

export async function fetchReferralHistory(
  page: number,
  limit = DEFAULT_HISTORY_LIMIT,
): Promise<{ history: ReferralHistoryItem[]; pagination: ReferralPagination }> {
  let res: Response;
  try {
    res = await fetch(`/api/user/referral/history?page=${page}&limit=${limit}`);
  } catch (err) {
    throw new Error(toPublicError(err));
  }
  if (!res.ok) throw new Error(`Referral history request failed: ${res.status}`);
  return (await res.json()) as {
    history: ReferralHistoryItem[];
    pagination: ReferralPagination;
  };
}
