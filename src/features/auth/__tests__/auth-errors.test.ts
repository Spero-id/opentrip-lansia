import { describe, expect, it } from "vitest";
import { translateAuthError } from "@/features/auth/auth-errors";

describe("translateAuthError", () => {
  it("maps sign-in failures to a generic Indonesian message", () => {
    expect(translateAuthError("Invalid email or password", "fallback")).toBe(
      "Email atau password salah"
    );
    expect(translateAuthError("Invalid password", "fallback")).toBe(
      "Email atau password salah"
    );
    expect(translateAuthError("User not found", "fallback")).toBe(
      "Email atau password salah"
    );
  });

  it("maps sign-up duplicate email to Indonesian", () => {
    expect(
      translateAuthError("User already exists. Use another email.", "fallback")
    ).toBe("Email sudah terdaftar");
  });

  it("returns the fallback when the message is empty", () => {
    expect(translateAuthError("", "Email atau password salah")).toBe(
      "Email atau password salah"
    );
    expect(translateAuthError(null, "Gagal mendaftar, coba lagi.")).toBe(
      "Gagal mendaftar, coba lagi."
    );
  });

  it("passes Indonesian and unknown messages through untouched", () => {
    expect(translateAuthError("Email atau password salah", "fallback")).toBe(
      "Email atau password salah"
    );
    expect(translateAuthError("Too many requests", "fallback")).toBe(
      "Too many requests"
    );
  });
});
