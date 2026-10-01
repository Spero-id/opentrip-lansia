
export const RETRY_DELAYS_MS = [120, 350];

export function isReadOnlyCall(args: unknown[]): boolean {
  const first = args[0];
  if (typeof first === "string") {
    return /^\s*select\b/i.test(first);
  }
  if (Array.isArray(first)) {
    const statements = first as string[];
    if (statements.length === 0) return false;
    const hasWrite = statements.some((s) =>
      /^\s*(insert|update|delete|merge|truncate|drop|alter)\b/i.test(s),
    );
    if (hasWrite) return false;
    return /^\s*select\b/i.test(statements.join(""));
  }
  return false;
}

export function isTransientError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    /^Error connecting to database:/i.test(msg) ||
    /^Server error \(HTTP status (429|[5-9]\d{2})\)/i.test(msg) ||
    /^Failed query:/i.test(msg)
  );
}