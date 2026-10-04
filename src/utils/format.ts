export function formatNumber(value: number | string): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const THOUSANDS_RE = /\B(?=(\d{3})+(?!\d))/g;

export function formatIDR(value: number | string | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string" && !/^-?\d+$/.test(value.trim())) return value;
  const num = Number(value);
  if (Number.isNaN(num)) return typeof value === "string" ? value : null;
  return "Rp " + Math.floor(num).toString().replace(THOUSANDS_RE, ".");
}

export function formatIDRCompact(value: number | string | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num)) return typeof value === "string" ? value : null;
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)}M`;
  if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(1)}Jt`;
  return "Rp " + Math.floor(num).toString().replace(THOUSANDS_RE, ".");
}