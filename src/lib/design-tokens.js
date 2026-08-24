// Shared design tokens for the OpenTrip Lansia frontend.
//
// These mirror the Private Trip module's visual language so every public page
// (Contact, Private Trip, etc.) stays consistent. Import these instead of
// hardcoding hex values or repeating long Tailwind class strings.
//
// Source of truth for the brand orange lives here — Private Trip components
// already reference `#F49D1A` (and its `#c47d12` hover) which are centralized
// below as `A` / `A_HOVER`.

// ── Brand ────────────────────────────────────────────────
export const A = "#F49D1A"; // primary orange (brand)
export const A_HOVER = "#c47d12"; // hover / active (was hardcoded across private components)

// ── Neutral palette (Private Trip grayscale) ─────────────
export const NEUTRAL = {
  bgPage: "#F9FAFB",
  bgCard: "#FFFFFF",
  bgSelected: "#FFFBEB", // amber-50, active card background
  borderLight: "#E5E7EB",
  borderDefault: "#D1D5DB",
  textHeading: "#1F2A37",
  textLabel: "#374151",
  textMuted: "#6B7280",
  textPlaceholder: "#9CA3AF",
};

// ── Semantic ────────────────────────────────────────────
export const SEMANTIC = {
  error: {
    required: "#DC2626", // required asterisk
    border: "red-300",
    borderFocus: "red-400",
    ring: "red-100",
    bg: "red-50",
    text: "red-500",
  },
  whatsapp: { base: "#25D366", hover: "#1ebe57" },
};

// ── Form primitives (from Private Trip Booking/Trip/Facilities sections) ──
export const baseInput =
  "w-full px-3 py-2.5 rounded-lg border text-[13px] leading-5 bg-white placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/30 transition-colors";
export const normalBorder = "border-[#D1D5DB] focus:border-[#F49D1A]";
export const errorBorder = "border-red-300 focus:border-red-400 focus:ring-red-100";

// ── Card ────────────────────────────────────────────────
export const card = "bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden";
