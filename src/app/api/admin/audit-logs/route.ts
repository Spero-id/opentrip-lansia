import { NextRequest } from "next/server";
import { auditController } from "@/features/audit/audit.controller";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return auditController.list(req);
}