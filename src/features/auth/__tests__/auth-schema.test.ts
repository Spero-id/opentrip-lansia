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
      firstName: "Budi",
      lastName: "Santoso",
      email: "budi@example.com",
      password: "rahasia123",
      confirmPassword: "rahasia123",
    });
    expect(result.success).toBe(true);
  });

  it("menolak nama belakang kosong", () => {
    const result = registerSchema.safeParse({
      firstName: "Budi",
      lastName: "",
      email: "budi@example.com",
      password: "rahasia123",
      confirmPassword: "rahasia123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Nama belakang wajib diisi");
  });

  it("menolak nama belakang hanya spasi", () => {
    const result = registerSchema.safeParse({
      firstName: "Budi",
      lastName: "   ",
      email: "budi@example.com",
      password: "rahasia123",
      confirmPassword: "rahasia123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Nama belakang wajib diisi");
  });

  it("menolak nama depan hanya spasi", () => {
    const result = registerSchema.safeParse({
      firstName: "   ",
      lastName: "Santoso",
      email: "budi@example.com",
      password: "rahasia123",
      confirmPassword: "rahasia123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Nama depan wajib diisi");
  });

  it("menolak nama depan kosong", () => {
    const result = registerSchema.safeParse({
      firstName: "",
      lastName: "Santoso",
      email: "budi@example.com",
      password: "rahasia123",
      confirmPassword: "rahasia123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Nama depan wajib diisi");
  });

  it("menolak password kurang dari 8 karakter", () => {
    const result = registerSchema.safeParse({
      firstName: "Budi",
      lastName: "Santoso",
      email: "budi@example.com",
      password: "pendek",
      confirmPassword: "pendek",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Kata sandi minimal 8 karakter");
  });

  it("menolak konfirmasi password kosong", () => {
    const result = registerSchema.safeParse({
      firstName: "Budi",
      lastName: "Santoso",
      email: "budi@example.com",
      password: "rahasia123",
      confirmPassword: "",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Ulangi kata sandi wajib diisi");
  });

  it("menolak konfirmasi password yang tidak sama", () => {
    const result = registerSchema.safeParse({
      firstName: "Budi",
      lastName: "Santoso",
      email: "budi@example.com",
      password: "rahasia123",
      confirmPassword: "berbeda123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Ulangi kata sandi tidak sama");
  });
});
