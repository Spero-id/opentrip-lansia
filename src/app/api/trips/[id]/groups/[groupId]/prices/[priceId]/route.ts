import { NextRequest } from "next/server";
import { groupController } from "@/features/trip/group.controller";
import { requireAdmin } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; groupId: string; priceId: string }> },
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return groupController.updatePrice(req, ctx);
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; groupId: string; priceId: string }> },
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return groupController.deletePrice(req, ctx);
}
