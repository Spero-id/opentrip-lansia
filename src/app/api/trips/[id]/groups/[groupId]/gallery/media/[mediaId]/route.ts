import { NextRequest } from "next/server";
import { groupController } from "@/features/trip/group.controller";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; groupId: string; mediaId: string }> },
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return groupController.detachMedia(req, ctx);
}
