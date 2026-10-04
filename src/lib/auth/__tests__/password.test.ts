// @vitest-environment node
import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  hashPassword,
  isLegacySha256,
  verifyPassword,
} from "@/lib/auth/password";

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

describe("isLegacySha256", () => {
  it("mengenali hash sha256 hex 64 karakter", () => {
    expect(isLegacySha256(sha256("rahasia"))).toBe(true);
  });

  it("menolak hash bcrypt", () => {
    expect(isLegacySha256("$2a$10$abcdefghijklmnopqrstuv")).toBe(false);
    expect(isLegacySha256("$2b$12$abcdefghijklmnopqrstuv")).toBe(false);
  });

  it("menolak string yang bukan hex atau keliru panjang", () => {
    expect(isLegacySha256("")).toBe(false);
    expect(isLegacySha256(sha256("x").slice(0, 63))).toBe(false);
    expect(isLegacySha256("z".repeat(64))).toBe(false);
  });
});

describe("verifyPassword dengan hash bcrypt", () => {
  it("menerima password yang benar", async () => {
    const hash = await hashPassword("kucing-kucing-9");
    expect(hash.startsWith("$2")).toBe(true);
    expect(isLegacySha256(hash)).toBe(false);
    await expect(verifyPassword("kucing-kucing-9", hash)).resolves.toBe(true);
  });

  it("menolak password yang salah", async () => {
    const hash = await hashPassword("kucing-kucing-9");
    await expect(verifyPassword("kucing-kucing-10", hash)).resolves.toBe(false);
  });

  it("menolak password kosong walau hash ada", async () => {
    const hash = await hashPassword("kucing-kucing-9");
    await expect(verifyPassword("", hash)).resolves.toBe(false);
  });

  it("menghasilkan hash berbeda untuk password sama karena salt", async () => {
    const a = await hashPassword("kucing-kucing-9");
    const b = await hashPassword("kucing-kucing-9");
    expect(a).not.toBe(b);
    await expect(verifyPassword("kucing-kucing-9", a)).resolves.toBe(true);
    await expect(verifyPassword("kucing-kucing-9", b)).resolves.toBe(true);
  });
});

describe("verifyPassword dengan hash sha256 legacy", () => {
  it("menerima password yang cocok", async () => {
    const hash = sha256("lama-sekali");
    expect(isLegacySha256(hash)).toBe(true);
    await expect(verifyPassword("lama-sekali", hash)).resolves.toBe(true);
  });

  it("menolak password yang salah", async () => {
    await expect(verifyPassword("salah", sha256("lama-sekali"))).resolves.toBe(
      false,
    );
  });

  it("tidak melempar saat hash rusak", async () => {
    await expect(verifyPassword("apa saja", "bukan-hash")).resolves.toBe(false);
    await expect(verifyPassword("apa saja", "$2a$10$potong")).resolves.toBe(
      false,
    );
  });
});