import { describe, expect, it } from "vitest";
import {
  DEFAULT_REDIRECT,
  buildAuthHref,
  readRedirectFromSearch,
  sanitizeRedirectPath,
} from "@/utils/redirect";

describe("sanitizeRedirectPath", () => {
  it("menerima path internal", () => {
    expect(sanitizeRedirectPath("/trips")).toBe("/trips");
    expect(sanitizeRedirectPath("/trips/123?tab=chat#ulasan")).toBe(
      "/trips/123?tab=chat#ulasan"
    );
    expect(sanitizeRedirectPath("/")).toBe("/");
  });

  it("menolak protocol-relative //evil.com", () => {
    expect(sanitizeRedirectPath("//evil.com")).toBe(DEFAULT_REDIRECT);
    expect(sanitizeRedirectPath("////evil.com")).toBe(DEFAULT_REDIRECT);
  });

  it("menolak backslash yang di-resolve jadi origin lain", () => {
    expect(sanitizeRedirectPath("/\\evil.com")).toBe(DEFAULT_REDIRECT);
    expect(sanitizeRedirectPath("/\\evil.com/path")).toBe(DEFAULT_REDIRECT);
    expect(sanitizeRedirectPath("\\\\evil.com")).toBe(DEFAULT_REDIRECT);
  });

  it("menolak absolute URL eksternal", () => {
    expect(sanitizeRedirectPath("https://evil.com")).toBe(DEFAULT_REDIRECT);
    expect(sanitizeRedirectPath("http://evil.com/trips")).toBe(
      DEFAULT_REDIRECT
    );
  });

  it("menolak URL berbahaya non-http", () => {
    expect(sanitizeRedirectPath("javascript:alert(1)")).toBe(
      DEFAULT_REDIRECT
    );
    expect(sanitizeRedirectPath("data:text/html,x")).toBe(DEFAULT_REDIRECT);
  });

  it("fallback untuk value kosong", () => {
    expect(sanitizeRedirectPath(null)).toBe(DEFAULT_REDIRECT);
    expect(sanitizeRedirectPath(undefined)).toBe(DEFAULT_REDIRECT);
    expect(sanitizeRedirectPath("")).toBe(DEFAULT_REDIRECT);
  });

  it("menghormati opsi allowAdmin", () => {
    expect(sanitizeRedirectPath("/admin", { allowAdmin: true })).toBe(
      "/admin"
    );
    expect(sanitizeRedirectPath("/admin", { allowAdmin: false })).toBe(
      DEFAULT_REDIRECT
    );
    expect(
      sanitizeRedirectPath("/admin/trips", { allowAdmin: false })
    ).toBe(DEFAULT_REDIRECT);
    expect(sanitizeRedirectPath("/trips", { allowAdmin: false })).toBe(
      "/trips"
    );
  });

  it("menghormati fallback kustom", () => {
    expect(sanitizeRedirectPath("//evil.com", { fallback: "/login" })).toBe(
      "/login"
    );
  });
});

describe("readRedirectFromSearch", () => {
  it("membaca param redirect dari query string", () => {
    expect(readRedirectFromSearch("?redirect=%2Ftrips")).toBe("/trips");
    expect(readRedirectFromSearch("?q=abc&redirect=%2Ftrips")).toBe(
      "/trips"
    );
  });

  it("fallback saat param tidak ada", () => {
    expect(readRedirectFromSearch("")).toBe(DEFAULT_REDIRECT);
    expect(readRedirectFromSearch("?q=abc")).toBe(DEFAULT_REDIRECT);
  });

  it("menolak nilai ter-encode yang membentuk origin lain", () => {
    expect(readRedirectFromSearch("?redirect=%2F%5Cevil.com")).toBe(
      DEFAULT_REDIRECT
    );
    expect(readRedirectFromSearch("?redirect=%2F%2Fevil.com")).toBe(
      DEFAULT_REDIRECT
    );
    expect(
      readRedirectFromSearch("?redirect=%2Fadmin", { allowAdmin: false })
    ).toBe(DEFAULT_REDIRECT);
  });
});

describe("buildAuthHref", () => {
  it("tanpa query saat redirect ke default", () => {
    expect(buildAuthHref("/register", DEFAULT_REDIRECT)).toBe("/register");
  });

  it("tanpa query untuk /admin", () => {
    expect(buildAuthHref("/login", "/admin")).toBe("/login");
  });

  it("meneruskan redirect non-default sebagai query", () => {
    expect(buildAuthHref("/register", "/trips")).toBe(
      "/register?redirect=%2Ftrips"
    );
  });

  it("encode nilai bercharacters spesial", () => {
    expect(buildAuthHref("/login", "/trips?tab=chat")).toBe(
      "/login?redirect=%2Ftrips%3Ftab%3Dchat"
    );
  });
});
