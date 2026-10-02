import { NextRequest } from "next/server";
import { groupController } from "@/features/trip/group.controller";
import { requireAdmin, requireSession } from "@/lib/auth";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string; groupId: string }> }) {
  const denied = await requireSession(req);
  if (denied) return denied;
  return groupController.getGallery(req, ctx);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string; groupId: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return groupController.createGallery(req, ctx);
}
