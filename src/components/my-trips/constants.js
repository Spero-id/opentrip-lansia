export const A = "#F49D1A";

// ─── Status Private Trip ───────────────────────────────────────────────────
export const STATUS_LABEL = {
  draft: "Draft",
  submitted: "Menunggu Review",
  reviewed: "Sedang Direview",
  approved: "Disetujui",
  rejected: "Ditolak",
  revision: "Perlu Revisi",
};

export const STATUS_COLOR = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-blue-100 text-blue-700",
  reviewed: "bg-violet-100 text-violet-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  revision: "bg-amber-100 text-amber-700",
};

export const PROPOSAL_LABEL = {
  pending: "Menunggu",
  accepted: "Diterima",
  rejected: "Ditolak",
  revised: "Revisi",
};

export const PROPOSAL_COLOR = {
  pending: "bg-blue-100 text-blue-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  revised: "bg-amber-100 text-amber-700",
};

// ─── Status Open Trip ──────────────────────────────────────────────────────
export const OPEN_TRIP_STATUS_LABEL = {
  pending_payment: "Menunggu Pembayaran",
  confirmed: "Terkonfirmasi",
  pending: "Menunggu Verifikasi",
  awaiting_verification: "Menunggu Verifikasi",
  cancelled: "Dibatalkan",
  completed: "Selesai",
};

export const OPEN_TRIP_STATUS_COLOR = {
  pending_payment: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  pending: "bg-blue-100 text-blue-700",
  awaiting_verification: "bg-orange-100 text-orange-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-gray-100 text-gray-600",
};

export const PAYMENT_STATUS_LABEL = {
  pending: "Menunggu Verifikasi",
  paid: "Lunas",
  rejected: "Ditolak",
  awaiting_verification: "Menunggu Verifikasi",
  pending_payment: "Menunggu Pembayaran",
};

export const PAYMENT_STATUS_COLOR = {
  pending: "text-blue-700",
  paid: "text-emerald-700",
  rejected: "text-red-700",
  awaiting_verification: "text-orange-700",
  pending_payment: "text-amber-700",
};

// ─── Helpers ───────────────────────────────────────────────────────────────
export function formatRupiah(val) {
  if (!val && val !== 0) return null;
  const num = typeof val === "string" ? parseInt(val.replace(/\D/g, ""), 10) : val;
  if (isNaN(num)) return null;
  return "Rp " + num.toLocaleString("id-ID");
}

export function toRequestCode(id) {
  return "PTR-" + id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

// ─── Ikon ──────────────────────────────────────────────────────────────────
export const icons = {
  copy: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  copied: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  chevron: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  send: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  eye: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  x: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  message: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
};
