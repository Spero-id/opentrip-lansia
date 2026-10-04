// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const VALID = {
  DATABASE_URL: "postgresql://user:pass@host:5432/db",
  BETTER_AUTH_SECRET: "s3cret",
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

  it("menyurut boot gagal bila BETTER_AUTH_SECRET kosong", async () => {
    await expect(
      loadServer({ ...VALID, BETTER_AUTH_SECRET: "" }),
    ).rejects.toThrow("Invalid environment variables");
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
      SMTP_HOST: "smtp.example.com",
      SMTP_USER: "mailer",
    });

    expect(env.DATABASE_URL).toBe(VALID.DATABASE_URL);
    expect(env.BETTER_AUTH_SECRET).toBe("s3cret");
    expect(env.BETTER_AUTH_URL).toBe("https://auth.example.com");
    expect(env.SMTP_HOST).toBe("smtp.example.com");
    expect(env.SMTP_USER).toBe("mailer");
  });

  it("mengubah SMTP_PORT menjadi number", async () => {
    const env = await loadServer({ ...VALID, SMTP_PORT: "2525" });
    expect(env.SMTP_PORT).toBe(2525);
  });

  it("memberi default 587 bila SMTP_PORT tidak diisi", async () => {
    const env = await loadServer({ ...VALID, SMTP_PORT: undefined });
    expect(env.SMTP_PORT).toBe(587);
  });

  it("mengubah SMTP_SECURE dari string menjadi boolean", async () => {
    expect((await loadServer({ ...VALID, SMTP_SECURE: "true" })).SMTP_SECURE).toBe(
      true,
    );
    expect(
      (await loadServer({ ...VALID, SMTP_SECURE: "false" })).SMTP_SECURE,
    ).toBe(false);
  });

  it("memberi default pada variabel opsional yang kosong", async () => {
    const env = await loadServer({
      ...VALID,
      GOOGLE_CLIENT_ID: undefined,
      SMTP_FROM: undefined,
      ADMIN_EMAIL: undefined,
      BASE_URL: undefined,
    });

    expect(env.GOOGLE_CLIENT_ID).toBe("");
    expect(env.SMTP_FROM).toBe("");
    expect(env.ADMIN_EMAIL).toBe("");
    expect(env.BASE_URL).toBe("http://localhost:3000");
  });
});