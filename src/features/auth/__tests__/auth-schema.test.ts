import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/features/auth/auth.schema";

describe("loginSchema", () => {
  it("menerima email dan password yang valid", () => {
    const result = loginSchema.safeParse({
      email: "budi@example.com",
      password: "rahasia123",
    });
    expect(result.success).toBe(true);
  });

  it("menolak email kosong", () => {
    const result = loginSchema.safeParse({ email: "", password: "rahasia123" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Email wajib diisi");
  });

  it("menolak format email tidak valid", () => {
    const result = loginSchema.safeParse({
      email: "budi-at-example",
      password: "rahasia123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Email tidak valid");
  });

  it("menolak password kosong", () => {
    const result = loginSchema.safeParse({ email: "budi@example.com", password: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Kata sandi wajib diisi");
  });
});

describe("registerSchema", () => {
  it("menerima data registrasi yang valid", () => {
    const result = registerSchema.safeParse({
      name: "Budi Santoso",
      email: "budi@example.com",
      password: "rahasia123",
    });
    expect(result.success).toBe(true);
  });

  it("menolak nama lengkap kosong", () => {
    const result = registerSchema.safeParse({
      name: "",
      email: "budi@example.com",
      password: "rahasia123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Nama lengkap wajib diisi");
  });

  it("menolak nama lengkap hanya spasi", () => {
    const result = registerSchema.safeParse({
      name: "   ",
      email: "budi@example.com",
      password: "rahasia123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Nama lengkap wajib diisi");
  });

  it("menolak nama lengkap lebih dari 255 karakter", () => {
    const result = registerSchema.safeParse({
      name: "a".repeat(256),
      email: "budi@example.com",
      password: "rahasia123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Nama lengkap maksimal 255 karakter");
  });

  it("menolak password kurang dari 8 karakter", () => {
    const result = registerSchema.safeParse({
      name: "Budi Santoso",
      email: "budi@example.com",
      password: "pendek",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Kata sandi minimal 8 karakter");
  });
});
