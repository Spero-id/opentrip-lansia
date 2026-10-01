import { AppError } from "./app-error";

export function toPublicError(err: unknown, fallback: string = "Terjadi kesalahan"): string {
  if (err instanceof AppError) {
    return err.message;
  }

  console.error("[api] non-AppError caught:", err);
  return fallback;
}
