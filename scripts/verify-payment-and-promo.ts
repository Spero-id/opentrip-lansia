/**
 * Verifikasi read-only (tanpa browser, tanpa dev server) untuk dua fix checkout:
 *
 *   1. Opsi BCA di step pembayaran — tampil hanya kalau payment_accounts lengkap.
 *   2. Diskon voucher — parser client & server memakai aturan yang sama
 *      (kasus AEZAKMI: value "70%" + max_discount 100000).
 *
 * Dipakai karena pemeriksaan browser (Playwright) ditunda pada mesin 8GB.
 * Tidak menulis apa pun ke database.
 *
 * Jalankan:  npx tsx scripts/verify-payment-and-promo.ts
 */
import { db } from "../src/shared/db";
import { paymentAccounts } from "../src/modules/payment/payment.schema";
import { promotions } from "../src/modules/promotion/promotion.schema";
import {
  availableMethods,
  findAccountByMethod,
  isCompleteAccount,
} from "../src/shared/payment/payment-account";
import { computePromoDiscount } from "../src/shared/promo/promo-discount";
import { parsePromoValue } from "../src/shared/promo/promo-value";

let failed = false;

// --- 1. Rekening bank / visibilitas BCA ------------------------------------
const accounts = await db.select().from(paymentAccounts);
console.log("=== payment_accounts ===");
for (const a of accounts) {
  console.log(
    `  ${a.method} | active=${a.isActive} | bank="${a.bankName}" | nomor="${a.accountNumber}" | pemilik="${a.accountHolder}" | lengkap=${isCompleteAccount(a)}`
  );
}
if (accounts.length === 0) {
  console.log("  (tidak ada baris) -> opsi BCA disembunyikan, QRIS tetap tampil");
}

const bca = findAccountByMethod(accounts, "BCA");
const visible = availableMethods(accounts, "ready") ?? [];
console.log(
  `\n  keputusan UI : metode tampil = [${visible.join(", ")}] | kartu BCA ${
    bca && isCompleteAccount(bca) ? "TAMPIL" : "SEMBUNYI"
  }`
);
if (bca && !isCompleteAccount(bca)) {
  console.log(
    "  -> baris BCA ada tapi TIDAK lengkap: ini kasus laporan, opsi BCA harus hilang"
  );
}
if (visible[0] !== "BCA" && visible.includes("QRIS")) {
  console.log("  -> pilihan default BCA dialihkan otomatis ke QRIS");
}

// --- 2. Diskon voucher ------------------------------------------------------
const rows = await db.select().from(promotions);
console.log("\n=== promotions (parse + diskon) ===");
const SUBTOTAL_LAPORAN = 2200000; // kasus laporan: 1 trip x Rp2.200.000
for (const p of rows) {
  const value = parsePromoValue(p.value, p.type);
  const clientOld = Number(p.value) || 0; // parser client LAMA
  const discount = computePromoDiscount(p, SUBTOTAL_LAPORAN);
  const total = SUBTOTAL_LAPORAN - discount;
  console.log(
    `  ${p.code.padEnd(10)} type=${String(p.type).padEnd(11)} value=${JSON.stringify(
      p.value
    ).padEnd(8)} max=${p.maxDiscount ?? "-"} -> nilai=${value} (client lama=${clientOld}) diskon=${discount} total=${total}`
  );
  if (clientOld !== value) {
    console.log(
      `             ^ PARSING BERBEDA dengan kode lama -> inilah penyebab "Total pembayaran tidak sesuai"`
    );
  }
}

const aezakmi = rows.find((r) => r.code.toUpperCase() === "AEZAKMI");
if (aezakmi) {
  const d = computePromoDiscount(aezakmi, SUBTOTAL_LAPORAN);
  const expected = 100000; // 70% x 2.200.000 = 1.540.000, di-cap max_discount
  console.log(
    `\n  AEZAKMI @ ${SUBTOTAL_LAPORAN}: diskon=${d} (ekspektasi ${expected}), total=${
      SUBTOTAL_LAPORAN - d
    }`
  );
  if (d !== expected) {
    console.log("  GAGAL: diskon tidak sesuai harapan");
    failed = true;
  }
} else {
  console.log("\n  (kode AEZAKMI tidak ada di DB ini — lewati pemeriksaan kasus laporan)");
}

console.log(`\n${failed ? "ADA KEGAGALAN" : "OK"}`);
process.exit(failed ? 1 : 0);
