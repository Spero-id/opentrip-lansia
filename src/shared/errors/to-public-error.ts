import { AppError } from "./app-error";

/**
 * Mengubah error apapun menjadi pesan yang AMAN dikirim ke client.
 *
 * Pendekatan allowlist (bukan blocklist): hanya pesan yang memang sengaja
 * dibuat developer lewat `AppError` (ValidationError, NotFoundError, dll)
 * yang boleh sampai ke user. Error lain — driver database, TypeError,
 * pesan dari library pihak ketiga, path file — dipastikan tidak pernah
 * bocor ke response.
 *
 * Error yang disensor TETAP di-log ke server console, supaya tetap bisa
 * didebug tanpa membocorkan internals ke browser.
 *
 * @param err      objek yang ditangkap di blok catch
 * @param fallback pesan generik yang ditampilkan ke user bila bukan AppError
 */
export function toPublicError(err: unknown, fallback: string = "Terjadi kesalahan"): string {
  if (err instanceof AppError) {
    // Pesan ini ditulis developer untuk user — boleh lewat.
    return err.message;
  }

  // Bukan AppError: kemungkinan internals (SQL, driver, library).
  // Log penuh di server, kembalikan hanya fallback ke client.
  console.error("[api] non-AppError caught:", err);
  return fallback;
}
