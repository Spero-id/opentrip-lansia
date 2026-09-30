/**
 * Regression test untuk sanitasi pesan error di API.
 *
 * Sebelum fix, hampir semua route handler melakukan:
 *     const message = err instanceof Error ? err.message : "Terjadi kesalahan";
 * sehingga internals (query SQL + params, pesan driver database, path file,
 * pesan dari library) ikut terkirim ke client. Terbukti live:
 *     GET /api/trips/x/groups -> {"error":"Failed query: select \"id\"... params: y"}
 *
 * Sekarang semua route memakai toPublicError() — allowlist: hanya AppError
 * (yang memang ditulis developer untuk user) yang boleh lewat.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";
import { AppError, NotFoundError, ValidationError, ConflictError } from "./app-error";
import { toPublicError } from "./to-public-error";

describe("toPublicError", () => {
  let errorSpy: MockInstance;

  beforeEach(() => {
    // toPublicError console.error untuk kasus non-AppError — bisukan supaya
    // output test bersih.
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => errorSpy.mockRestore());

  it("meneruskan pesan ValidationError apa adanya (pesan untuk user)", () => {
    expect(toPublicError(new ValidationError("Kode promo tidak valid")))
      .toBe("Kode promo tidak valid");
  });

  it("meneruskan pesan NotFoundError apa adanya", () => {
    expect(toPublicError(new NotFoundError("Grup"))).toBe("Grup tidak ditemukan");
    expect(toPublicError(new NotFoundError("Trip"))).toBe("Trip tidak ditemukan");
  });

  it("meneruskan pesan ConflictError apa adanya", () => {
    expect(toPublicError(new ConflictError("Kuota promo habis"))).toBe("Kuota promo habis");
  });

  it("meneruskan AppError generik dengan teks asli", () => {
    expect(toPublicError(new AppError("Request not found", "NOT_FOUND", 404)))
      .toBe("Request not found");
    expect(toPublicError(new AppError("Proposal not found", "NOT_FOUND", 404)))
      .toBe("Proposal not found");
  });

  it("MENYENSOR query SQL + params (kasus yang pernah bocor live)", () => {
    const dbError = new Error(
      'Failed query: select "id", "type", "title" from "trips" where "trips"."id" = $1\nparams: y',
    );
    expect(toPublicError(dbError)).toBe("Terjadi kesalahan");
    expect(toPublicError(dbError)).not.toContain("select");
    expect(toPublicError(dbError)).not.toContain("params");
  });

  it("menyensor pesan koneksi database", () => {
    expect(toPublicError(new Error("Error connecting to database: ep-spring.neon.tech")))
      .toBe("Terjadi kesalahan");
  });

  it("menyensor path file & pesan sistem", () => {
    expect(toPublicError(new Error("ENOENT: no such file or directory, open '/app/uploads/x.jpg'")))
      .toBe("Terjadi kesalahan");
    expect(toPublicError(new TypeError("Cannot read properties of undefined (reading 'rows')")))
      .toBe("Terjadi kesalahan");
  });

  it("menyensor error validasi JSON mentah dari framework", () => {
    expect(toPublicError(new SyntaxError("Unexpected token 'n', ...is not valid JSON")))
      .toBe("Terjadi kesalahan");
  });

  it("menghormati fallback khusus dari pemanggil", () => {
    expect(toPublicError(new Error("internal detail"), "Terjadi kesalahan saat upload."))
      .toBe("Terjadi kesalahan saat upload.");
    expect(toPublicError(new Error("internal detail"), "Gagal menyimpan request"))
      .toBe("Gagal menyimpan request");
  });

  it("menangani nilai non-Error (null/undefined/string)", () => {
    expect(toPublicError(null)).toBe("Terjadi kesalahan");
    expect(toPublicError(undefined)).toBe("Terjadi kesalahan");
    expect(toPublicError("string mentah")).toBe("Terjadi kesalahan");
  });

  it("SELALU meng-log error aslinya ke server agar tetap bisa didebug", () => {
    const internal = new Error("detail database rahasia");
    toPublicError(internal, "Terjadi kesalahan");
    expect(errorSpy).toHaveBeenCalledWith("[api] non-AppError caught:", internal);
  });

  it("TIDAK meng-log AppError (memang disengaja, bukan kejadian)", () => {
    toPublicError(new ValidationError("Kode promo tidak valid"));
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
