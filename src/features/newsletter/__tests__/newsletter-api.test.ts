import { describe, expect, it, vi, afterEach } from "vitest";
import { subscribeNewsletter } from "@/features/newsletter/api/client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("subscribeNewsletter", () => {
  it("returns ok on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }));
    await expect(subscribeNewsletter("user@mail.id")).resolves.toEqual({ ok: true });
  });

  it("returns server error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: "Email sudah terdaftar" }) }),
    );
    await expect(subscribeNewsletter("user@mail.id")).resolves.toEqual({
      ok: false,
      error: "Email sudah terdaftar",
    });
  });

  it("falls back when server gives no message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({}) }));
    await expect(subscribeNewsletter("user@mail.id")).resolves.toEqual({
      ok: false,
      error: "Gagal berlangganan",
    });
  });

  it("returns fallback on network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    await expect(subscribeNewsletter("user@mail.id")).resolves.toEqual({
      ok: false,
      error: "Terjadi kesalahan, coba lagi nanti",
    });
  });
});
