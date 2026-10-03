export type AuditAction = "create" | "update" | "delete";

export interface AuditRecordInput {
  adminId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  description?: string | null;
}

export interface AuditEntry {
  id: string;
  adminId: string | null;
  adminName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  description: string | null;
  createdAt: Date | null;
}

export interface AuditListFilter {
  entityType?: string | null;
  entityId?: string | null;
  adminId?: string | null;
  action?: string | null;
  from?: string | null;
  to?: string | null;
  limit?: number;
}