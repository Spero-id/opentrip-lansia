import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";
import { AppError, NotFoundError, ValidationError, ConflictError } from "./app-error";
import { toPublicError } from "./to-public-error";

describe("toPublicError", () => {
  let errorSpy: MockInstance;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => errorSpy.mockRestore());

  describe("message passthrough", () => {
    it("passes a ValidationError message through untouched (user-facing copy)", () => {
      expect(toPublicError(new ValidationError("Kode promo tidak valid"))).toBe(
        "Kode promo tidak valid"
      );
    });

    it("passes a composed NotFoundError message through", () => {
      expect(toPublicError(new NotFoundError("Grup"))).toBe("Grup tidak ditemukan");
      expect(toPublicError(new NotFoundError("Trip"))).toBe("Trip tidak ditemukan");
    });

    it("passes a ConflictError message through untouched", () => {
      expect(toPublicError(new ConflictError("Kuota promo habis"))).toBe("Kuota promo habis");
    });

    it("passes a generic AppError message through with its original text", () => {
      expect(toPublicError(new AppError("Request not found", "NOT_FOUND", 404))).toBe(
        "Request not found"
      );
      expect(toPublicError(new AppError("Proposal not found", "NOT_FOUND", 404))).toBe(
        "Proposal not found"
      );
    });
  });

  describe("redaction of internal details", () => {
    it("redacts raw SQL and params (past live-leak case)", () => {
      const dbError = new Error(
        'Failed query: select "id", "type", "title" from "trips" where "trips"."id" = $1\nparams: y',
      );
      expect(toPublicError(dbError)).toBe("Terjadi kesalahan");
      expect(toPublicError(dbError)).not.toContain("select");
      expect(toPublicError(dbError)).not.toContain("params");
    });

    it("redacts database connection messages", () => {
      expect(toPublicError(new Error("Error connecting to database: ep-spring.neon.tech"))).toBe(
        "Terjadi kesalahan"
      );
    });

    it("redacts file paths and system messages", () => {
      expect(
        toPublicError(new Error("ENOENT: no such file or directory, open '/app/uploads/x.jpg'"))
      ).toBe("Terjadi kesalahan");
      expect(toPublicError(new TypeError("Cannot read properties of undefined (reading 'rows')"))).toBe(
        "Terjadi kesalahan"
      );
    });

    it("redacts raw JSON validation errors from the framework", () => {
      expect(toPublicError(new SyntaxError("Unexpected token 'n', ...is not valid JSON"))).toBe(
        "Terjadi kesalahan"
      );
    });
  });

  describe("fallback and diagnostics", () => {
    it("honors a caller-provided fallback message", () => {
      expect(toPublicError(new Error("internal detail"), "Terjadi kesalahan saat upload.")).toBe(
        "Terjadi kesalahan saat upload."
      );
      expect(toPublicError(new Error("internal detail"), "Gagal menyimpan request")).toBe(
        "Gagal menyimpan request"
      );
    });

    it("handles non-Error values (null, undefined, raw string)", () => {
      expect(toPublicError(null)).toBe("Terjadi kesalahan");
      expect(toPublicError(undefined)).toBe("Terjadi kesalahan");
      expect(toPublicError("string mentah")).toBe("Terjadi kesalahan");
    });

    it("always logs the original error server-side so it stays debuggable", () => {
      const internal = new Error("detail database rahasia");
      toPublicError(internal, "Terjadi kesalahan");
      expect(errorSpy).toHaveBeenCalledWith("[api] non-AppError caught:", internal);
    });

    it("never logs an AppError (expected, user-safe path)", () => {
      toPublicError(new ValidationError("Kode promo tidak valid"));
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });
});
