// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ENV_DIR = path.join(ROOT, "src/lib/env");

function declaredKeys(): string[] {
  const source = ["client.ts", "server.ts"]
    .map((file) => fs.readFileSync(path.join(ENV_DIR, file), "utf8"))
    .join("\n");
  return [...source.matchAll(/^export const ([A-Z][A-Z0-9_]+) =/gm)].map((m) => m[1]);
}

function exampleKeys(): string[] {
  const source = fs.readFileSync(path.join(ROOT, ".env.example"), "utf8");
  return source
    .split("\n")
    .filter((line) => /^[A-Z][A-Z0-9_]*=/.test(line))
    .map((line) => line.split("=")[0]);
}

describe("env schema vs .env.example", () => {
  it("mendeklarasikan variabel yang tidak nol", () => {
    expect(declaredKeys().length).toBeGreaterThan(10);
  });

  it("mencatat setiap variabel di .env.example", () => {
    const missing = declaredKeys().filter((key) => !exampleKeys().includes(key));
    expect(missing).toEqual([]);
  });

  it("tidak mencantumkan variabel yang sudah tidak ada di skema", () => {
    const stale = exampleKeys().filter((key) => !declaredKeys().includes(key));
    expect(stale).toEqual([]);
  });
});

const hasRealEnv = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasRealEnv)("env terhadap .env sungguhan", () => {
  it("memuat tanpa melempar dan menjaga skema postgres", async () => {
    const env = await import("@/lib/env/server");

    expect(env.DATABASE_URL).toMatch(/^postgres(ql)?:\/\//);
    expect(env.BETTER_AUTH_SECRET.length).toBeGreaterThan(0);
    expect(() => new URL(env.BASE_URL)).not.toThrow();
    expect(() => new URL(env.BETTER_AUTH_URL)).not.toThrow();
  });

  it("memberi SMTP_PORT berupa nomor port yang bisa dipakai", async () => {
    const env = await import("@/lib/env/server");

    expect(Number.isInteger(env.SMTP_PORT)).toBe(true);
    expect(env.SMTP_PORT).toBeGreaterThan(0);
    expect(env.SMTP_PORT).toBeLessThanOrEqual(65535);
    expect(typeof env.SMTP_SECURE).toBe("boolean");
  });

  it("memuat client env tanpa menyentuh variabel server", async () => {
    const env = await import("@/lib/env/client");

    expect(typeof env.NEXT_PUBLIC_WHATSAPP_NUMBER).toBe("string");
    expect(typeof env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION).toBe("boolean");
    expect(env).not.toHaveProperty("DATABASE_URL");
    expect(env).not.toHaveProperty("BETTER_AUTH_SECRET");
  });
});