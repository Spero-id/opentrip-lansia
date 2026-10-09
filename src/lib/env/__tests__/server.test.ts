// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const VALID = {
  DATABASE_URL: "postgresql://user:pass@host:5432/db",
  BETTER_AUTH_SECRET: "s3cret",
  RESEND_API_KEY: "re_test_key",
};

async function loadServer(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return import("@/lib/env/server");
}

describe("env/server", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("menyuruh boot gagal bila DATABASE_URL hilang", async () => {
    await expect(
      loadServer({ ...VALID, DATABASE_URL: undefined }),
    ).rejects.toThrow("Invalid environment variables");
  });

  it("menyuruh boot gagal bila BETTER_AUTH_SECRET kosong", async () => {
    await expect(
      loadServer({ ...VALID, BETTER_AUTH_SECRET: "" }),
    ).rejects.toThrow("Invalid environment variables");
  });

  it("menyuruh boot gagal bila RESEND_API_KEY hilang", async () => {
    await expect(
      loadServer({ ...VALID, RESEND_API_KEY: undefined }),
    ).rejects.toThrow("Invalid environment variables");
    await expect(loadServer({ ...VALID, RESEND_API_KEY: "" })).rejects.toThrow(
      "Invalid environment variables",
    );
  });

  it("menolak DATABASE_URL yang bukan URL", async () => {
    await expect(
      loadServer({ ...VALID, DATABASE_URL: "host=localhost port=5432" }),
    ).rejects.toThrow("Invalid environment variables");
  });

  it("menolak string koneksi tanpa skema postgres", async () => {
    await expect(
      loadServer({ ...VALID, DATABASE_URL: "localhost:5432/db" }),
    ).rejects.toThrow("Invalid environment variables");
  });

  it("menerima URL NeonDB postgresql://", async () => {
    const url =
      "postgresql://user:pass@ep-frost-azrtnxj8.aws.neon.tech/neondb?sslmode=require";
    const env = await loadServer({ ...VALID, DATABASE_URL: url });
    expect(env.DATABASE_URL).toBe(url);
  });

  it("membaca variabel server yang valid", async () => {
    const env = await loadServer({
      ...VALID,
      BETTER_AUTH_URL: "https://auth.example.com",
      GOOGLE_CLIENT_ID: "client-id",
      ADMIN_EMAIL: "admin@example.com",
      RESEND_EMAIL_FROM: "sistem@example.com",
    });

    expect(env.DATABASE_URL).toBe(VALID.DATABASE_URL);
    expect(env.BETTER_AUTH_SECRET).toBe("s3cret");
    expect(env.BETTER_AUTH_URL).toBe("https://auth.example.com");
    expect(env.GOOGLE_CLIENT_ID).toBe("client-id");
    expect(env.ADMIN_EMAIL).toBe("admin@example.com");
    expect(env.RESEND_EMAIL_FROM).toBe("sistem@example.com");
  });

  it("memberi default pada variabel opsional yang kosong", async () => {
    const env = await loadServer({
      ...VALID,
      GOOGLE_CLIENT_ID: undefined,
      GOOGLE_CLIENT_SECRET: undefined,
      ADMIN_EMAIL: undefined,
      RESEND_EMAIL_FROM: undefined,
      BETTER_AUTH_URL: undefined,
      BASE_URL: undefined,
    });

    expect(env.GOOGLE_CLIENT_ID).toBe("");
    expect(env.GOOGLE_CLIENT_SECRET).toBe("");
    expect(env.ADMIN_EMAIL).toBe("");
    expect(env.RESEND_EMAIL_FROM).toBe("onboarding@resend.dev");
    expect(env.BETTER_AUTH_URL).toBe("http://localhost:3000");
    expect(env.BASE_URL).toBe("http://localhost:3000");
  });

  it("memperlakukan string kosong sebagai belum diisi", async () => {
    const env = await loadServer({
      ...VALID,
      BETTER_AUTH_URL: "",
      BASE_URL: "",
      RESEND_EMAIL_FROM: "",
      ADMIN_EMAIL: "",
    });

    expect(env.BETTER_AUTH_URL).toBe("http://localhost:3000");
    expect(env.BASE_URL).toBe("http://localhost:3000");
    expect(env.RESEND_EMAIL_FROM).toBe("onboarding@resend.dev");
    expect(env.ADMIN_EMAIL).toBe("");
  });
});
