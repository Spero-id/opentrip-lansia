// Maps better-auth server error messages (English) to Indonesian UI copy.
// Unknown messages pass through untouched so debugging info is never hidden.

const KNOWN_MESSAGES: Array<{ pattern: RegExp; text: string }> = [
  // signIn.email failures - kept generic on purpose so the UI never reveals
  // whether the email or the password was wrong.
  { pattern: /invalid (email or )?password/i, text: "Email atau password salah" },
  { pattern: /user not found/i, text: "Email atau password salah" },
  // signUp.email failures.
  { pattern: /user already exists/i, text: "Email sudah terdaftar" },
];

export function translateAuthError(
  message: string | null | undefined,
  fallback: string
): string {
  if (!message) return fallback;
  for (const { pattern, text } of KNOWN_MESSAGES) {
    if (pattern.test(message)) return text;
  }
  return message;
}
