import { NextRequest, NextResponse } from "next/server";
import { auditService } from "./audit.service";
import type { AuditListFilter } from "./audit.types";
import { toPublicError } from "@/utils/errors/to-public-error";

const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 50;

function parseLimit(raw: string | null): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(parsed), MAX_LIMIT);
}

export const auditController = {
  async list(req: NextRequest) {
    try {
      const params = req.nextUrl.searchParams;
      const filter: AuditListFilter = {
        entityType: params.get("entityType"),
        entityId: params.get("entityId"),
        adminId: params.get("adminId"),
        action: params.get("action"),
        from: params.get("from"),
        to: params.get("to"),
        limit: parseLimit(params.get("limit")),
      };
      const entries = await auditService.list(filter);
      return NextResponse.json(entries);
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },
};