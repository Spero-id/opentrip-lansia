import { db } from "@/lib/db";
import { auditLogs } from "@/db/schema/utility";
import { users } from "@/db/schema/auth";
import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import type { UUID } from "@/types";
import type { AuditAction, AuditEntry, AuditListFilter } from "./audit.types";

export interface AuditInsertValues {
  adminId: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  description: string | null;
}

export const auditRepository = {
  async insert(values: AuditInsertValues) {
    const [row] = await db.insert(auditLogs).values(values).returning({ id: auditLogs.id });
    return row;
  },

  async list(filter: AuditListFilter): Promise<AuditEntry[]> {
    const conditions = [];
    if (filter.entityType) conditions.push(eq(auditLogs.entityType, filter.entityType));
    if (filter.action) conditions.push(eq(auditLogs.action, filter.action));
    if (filter.adminId) conditions.push(eq(auditLogs.adminId, filter.adminId));
    if (filter.entityId) conditions.push(eq(auditLogs.entityId, filter.entityId));
    if (filter.from) conditions.push(gte(auditLogs.createdAt, new Date(filter.from)));
    if (filter.to) conditions.push(lte(auditLogs.createdAt, new Date(filter.to)));
    const where = conditions.length ? and(...conditions) : undefined;
    const query = db
      .select({
        id: auditLogs.id,
        adminId: auditLogs.adminId,
        adminName: users.name,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        oldValues: auditLogs.oldValues,
        newValues: auditLogs.newValues,
        description: auditLogs.description,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .leftJoin(users, eq(users.id, auditLogs.adminId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(Math.min(filter.limit ?? 50, 200));
    const rows = where ? await query.where(where) : await query;
    return rows as AuditEntry[];
  },

  /** History for a set of entities, newest first (used by trip price history). */
  async listByEntityIds(entityIds: UUID[], limit = 50) {
    if (entityIds.length === 0) return [];
    const rows = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        description: auditLogs.description,
        adminName: users.name,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .leftJoin(users, eq(users.id, auditLogs.adminId))
      .where(inArray(auditLogs.entityId, entityIds))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
    return rows;
  },
};