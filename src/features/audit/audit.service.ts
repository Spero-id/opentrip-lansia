import type { UUID } from "@/types";
import { auditRepository } from "./audit.repository";
import type { AuditListFilter, AuditRecordInput } from "./audit.types";

const REDACTED = "[redacted]";

const SENSITIVE_KEYS = new Set([
  "password",
  "newpassword",
  "currentpassword",
  "token",
  "accesstoken",
  "refreshtoken",
  "secret",
  "apikey",
  "authorization",
  "sessiontoken",
  "pin",
]);

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.has(normalizeKey(key));
}

function redactObject(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    out[key] = isSensitiveKey(key) ? REDACTED : value;
  }
  return out;
}

function toComparable(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/**
 * Pick only allowlisted fields that actually changed, with sensitive keys redacted.
 * Keeps jsonb small — never dump a whole row.
 */
export function diffFields(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined,
  allowlist: readonly string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!after) return out;
  for (const field of allowlist) {
    if (isSensitiveKey(field)) {
      out[field] = REDACTED;
      continue;
    }
    const next = after[field];
    const prev = before ? before[field] : undefined;
    if (toComparable(next) !== toComparable(prev)) out[field] = next ?? null;
  }
  return out;
}

/** Redact without diffing (used for create snapshots). */
export function pickFields(
  source: object | null | undefined,
  allowlist: readonly string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!source) return out;
  const record = source as Record<string, unknown>;
  for (const field of allowlist) {
    out[field] = isSensitiveKey(field) ? REDACTED : record[field] ?? null;
  }
  return out;
}

export const auditService = {
  /**
   * Append-only writer. Never throws: a failing audit must not break the business write.
   */
  async record(input: AuditRecordInput): Promise<string | null> {
    try {
      const row = await auditRepository.insert({
        adminId: input.adminId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        oldValues: input.oldValues ? redactObject(input.oldValues) : null,
        newValues: input.newValues ? redactObject(input.newValues) : null,
        description: input.description ?? null,
      });
      return row?.id ?? null;
    } catch (err) {
      console.error("recordAudit failed:", err);
      return null;
    }
  },

  list(filter: AuditListFilter) {
    return auditRepository.list(filter);
  },

  listByEntityIds(entityIds: UUID[], limit?: number) {
    return auditRepository.listByEntityIds(entityIds, limit);
  },
};