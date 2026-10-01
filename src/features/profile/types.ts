export interface ProfileUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  phone?: string | null;
  createdAt?: string | Date | null;
  referralCode?: string | null;
}

export interface ReferralSummary {
  referralCode: string | null;
  loyaltyPoints: number;
  stats: {
    totalReferred: number;
    convertedReferred: number;
    pendingReferred: number;
    totalCommission: number;
  };
}

export interface ReferralCardStats {
  totalReferred?: number | null;
  totalCommission?: number | null;
}

export interface ReferralHistoryItem {
  id: string;
  referredUserName?: string | null;
  referredUserEmail?: string | null;
  bookingCode?: string | null;
  tripName?: string | null;
  status: string;
  commissionAmount?: number | null;
  commissionStatus?: string | null;
  createdAt: string | Date;
}

export interface ReferralPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
