/**
 * Retry policy for the Neon serverless HTTP driver.
 *
 * Neon's HTTP endpoint occasionally fails a request transiently (cold start
 * after scale-to-zero, brief endpoint errors, rate limiting). Those failures
 * surface as:
 *   - "Error connecting to database: ..."  (network / fetch failure)
 *   - "Server error (HTTP status 429|5xx): ..."
 *   - HTTP 400 "Failed query: ..." (server-side abort, e.g. during compute restart)
 *
 * We retry these — but ONLY for read-only queries (plain SELECT statements),
 * so retries can never duplicate writes/transactions. Genuinely invalid SQL
 * fails again instantly and is rethrown.
 */

export const RETRY_DELAYS_MS = [120, 350];

/** True only when every statement in the call is a read (SELECT). */
export function isReadOnlyCall(args: unknown[]): boolean {
  const first = args[0];
  if (typeof first === "string") {
    return /^\s*select\b/i.test(first);
  }
  if (Array.isArray(first)) {
    const statements = first as string[];
    if (statements.length === 0) return false;
    // A write at the start of any statement blocks retry (covers both
    // transparent batches with complete queries and tagged-template segments).
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