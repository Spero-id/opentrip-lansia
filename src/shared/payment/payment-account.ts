/**
 * Aturan visibilitas rekening bank untuk step pembayaran checkout.
 *
 * Permintaan: "Rekening BCA kalau belum ada nomor rekeningnya tolong
 * disembunyikan aja." — opsi BCA hanya boleh tampil kalau rekeningnya
 * benar-benar lengkap, supaya user tidak memilih bank yang nomor
 * transfernya kosong (atau baris Salin yang menyalin string kosong).
 *
 * Dipakui oleh client (PaymentStep.jsx) dan server (/api/payments/accounts)
 * supaya keduanya sepakat soal rekening yang "lengkap".
 */

export type AccountsStatus = "loading" | "ready" | "error";

export interface PaymentAccountLike {
  method?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  accountHolder?: string | null;
  isActive?: boolean | null;
}

function hasText(value: unknown): boolean {
  return String(value ?? "").trim().length > 0;
}

/**
 * Rekening hanya dianggap layak tampil jika bank, nomor, dan pemilik
 * semuanya terisi. Kolom bertipe NOT NULL tetapi bisa berisi "" / " ",
 * jadi ceknya harus trim, bukan sekadar truthy.
 */
export function isCompleteAccount(
  account: PaymentAccountLike | null | undefined
): boolean {
  if (!account) return false;
  return (
    hasText(account.bankName) &&
    hasText(account.accountNumber) &&
    hasText(account.accountHolder)
  );
}

/** Cari rekening berdasarkan method ("BCA"/"bca"/" BCA ") tanpa memandang huruf besar-kecil. */
export function findAccountByMethod(
  accounts: PaymentAccountLike[] | null | undefined,
  method: string
): PaymentAccountLike | null {
  const target = String(method ?? "").trim().toLowerCase();
  if (!target || !Array.isArray(accounts)) return null;
  return (
    accounts.find(
      (a) => String(a?.method ?? "").trim().toLowerCase() === target
    ) ?? null
  );
}

/**
 * Metode yang boleh ditampilkan/dipilih.
 * `null` hanya saat masih dimuat — keputusan ditahan dulu supaya pilihan
 * tidak berpindah sebelum data datang. Saat gagal dimuat, tetap fail-closed:
 * hanya QRIS (rekening bank dianggap tidak tersedia).
 */
export function availableMethods(
  accounts: PaymentAccountLike[] | null | undefined,
  status: AccountsStatus,
  bankMethods: string[] = ["BCA"]
): string[] | null {
  if (status === "loading") return null;
  const source = status === "ready" && Array.isArray(accounts) ? accounts : [];
  const visible = bankMethods.filter((m) =>
    isCompleteAccount(findAccountByMethod(source, m))
  );
  // QRIS digambar hardcoded di UI, selalu tersedia sebagai jalur cadangan
  if (!visible.includes("QRIS")) visible.push("QRIS");
  return visible;
}

/**
 * Pilihan yang valid untuk ditampilkan/dikirim.
 * Penting: default `paymentMethod` di useCheckout adalah "BCA" — kalau BCA
 * disembunyikan, pilihan jatuh ke metode pertama yang tersedia (QRIS) sehingga
 * user tidak pernah mengirim bukti dengan metode yang tidak ia lihat.
 */
export function resolveActiveMethod(
  current: string | null | undefined,
  visible: string[] | null | undefined
): string | null {
  if (!visible || visible.length === 0) return current ?? null;
  if (current && visible.includes(current)) return current;
  return visible[0];
}
