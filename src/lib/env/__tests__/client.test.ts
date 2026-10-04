// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function loadClient(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return import("@/lib/env/client");
}

describe("env/client", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("memakai nilai dari environment saat tersedia", async () => {
    const env = await loadClient({
      NEXT_PUBLIC_BETTER_AUTH_URL: "https://app.example.com",
      NEXT_PUBLIC_WHATSAPP_NUMBER: "628999",
      NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION: "true",
    });

    expect(env.NEXT_PUBLIC_BETTER_AUTH_URL).toBe("https://app.example.com");
    expect(env.NEXT_PUBLIC_WHATSAPP_NUMBER).toBe("628999");
    expect(env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION).toBe(true);
  });

  it("memberi default bila variabel tidak ada", async () => {
    const env = await loadClient({
      NEXT_PUBLIC_BETTER_AUTH_URL: undefined,
      NEXT_PUBLIC_WHATSAPP_NUMBER: undefined,
      NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION: undefined,
      NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: undefined,
    });

    expect(env.NEXT_PUBLIC_BETTER_AUTH_URL).toBe("http://localhost:3000");
    expect(env.NEXT_PUBLIC_WHATSAPP_NUMBER).toBe("");
    expect(env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY).toBe("");
    expect(env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION).toBe(false);
  });

  it("menolak URL yang tidak valid", async () => {
    await expect(
      loadClient({ NEXT_PUBLIC_BETTER_AUTH_URL: "app.example.com" }),
    ).rejects.toThrow("Invalid environment variables");
  });

  it("menolak nilai boolean di luar true atau false", async () => {
    await expect(
      loadClient({ NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION: "yes" }),
    ).rejects.toThrow("Invalid environment variables");
  });
});