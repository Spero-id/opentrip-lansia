/**
 * Parser tunggal untuk nilai promo.
 *
 * Sebelumnya ada 3 parser berbeda untuk kolom `promotions.value`:
 *  - client checkout: `Number(value)`      -> "70%" = NaN  -> 0
 *  - server checkout: `toNumber(value)`    -> "70%" = 70   (digit saja)
 *  - promotion.service: `parseInt(value)`  -> "70%" = 70
 *
 * Akibatnya promo "70%" dihitung 0% di UI (tanpa diskon tampil) sementara
 * server memotong 70% -> total dikirim client tidak sama dengan total yang
 * diharapkan server -> 400 "Total pembayaran tidak sesuai."
 *
 * Kolom `value`, `minPurchase`, dan `maxDiscount` bertipe varchar, jadi isi
 * bebas ("70", "70%", "100.000", "Rp100.000"). Kedua sisi (client & server)
 * WAJIB memakai parser ini supaya angkanya identik.
 */

/** Uang (IDR): buang semua karakter non-angka, "100.000" -> 100000. */
export function parseMoney(raw: unknown): number {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return 0;
  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Nilai promo sesuai tipenya:
 *  - "percentage": "70%" / "70" / "7,5" -> 70 / 70 / 7.5
 *  - "nominal"   : "100.000" / "Rp100.000" / "100000" -> 100000
 */
export function parsePromoValue(raw: unknown, type: string): number {
  const s = String(raw ?? "").trim();
  if (!s) return 0;

  if (type === "percentage") {
    const cleaned = s
      .replace(/[^\d.,-]/g, "") // buang "%", "Rp", spasi, dll
      .replace(",", ".");
    if (!cleaned) return 0;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  return parseMoney(s);
}
