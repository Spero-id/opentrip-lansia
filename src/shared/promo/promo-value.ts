
export function parseMoney(raw: unknown): number {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return 0;
  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
}

export function parsePromoValue(raw: unknown, type: string): number {
  const s = String(raw ?? "").trim();
  if (!s) return 0;

  if (type === "percentage") {
    const cleaned = s
      .replace(/[^\d.,-]/g, "")
      .replace(",", ".");
    if (!cleaned) return 0;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  return parseMoney(s);
}
