import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export const registerSchema = z
  .object({
    // .trim() normalizes whitespace-only input: firstName " " then fails
    // min(1); lastName is likewise required after trim.
    firstName: z
      .string()
      .trim()
      .min(1, "Nama depan wajib diisi")
      .max(255, "Nama depan maksimal 255 karakter"),
    lastName: z
      .string()
      .trim()
      .min(1, "Nama belakang wajib diisi")
      .max(255, "Nama belakang maksimal 255 karakter"),
    email: z.string().min(1, "Email wajib diisi").email("Email tidak valid").max(255),
    password: z
      .string()
      .min(1, "Kata sandi wajib diisi")
      .min(8, "Kata sandi minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Ulangi kata sandi wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Ulangi kata sandi tidak sama",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
