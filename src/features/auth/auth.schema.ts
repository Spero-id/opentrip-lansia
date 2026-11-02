import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

// The old confirmPassword field (and its equal-password refine) was removed:
// PasswordField already ships a show/hide toggle (the protection NIST
// SP 800-63B and NN/g recommend over retyping), so a mismatched retype test
// added friction without catching the blind-repetition typos it targeted.
export const registerSchema = z.object({
    // .trim() normalizes whitespace-only input: a single "Nama Lengkap"
    // field (merged from the former firstName/lastName pair) must not be
    // blank or spaces-only.
    name: z
      .string()
      .trim()
      .min(1, "Nama lengkap wajib diisi")
      .max(255, "Nama lengkap maksimal 255 karakter"),
    email: z.string().min(1, "Email wajib diisi").email("Email tidak valid").max(255),
    password: z
      .string()
      .min(1, "Kata sandi wajib diisi")
      .min(8, "Kata sandi minimal 8 karakter"),
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
