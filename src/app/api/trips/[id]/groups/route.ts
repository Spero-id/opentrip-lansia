import { NextRequest } from "next/server";
import { groupController } from "@/features/trip/group.controller";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return groupController.list(req, ctx);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return groupController.create(req, ctx);
}
