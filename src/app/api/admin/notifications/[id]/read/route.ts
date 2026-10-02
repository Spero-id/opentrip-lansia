import { NextRequest } from "next/server";
import { notificationController } from "@/features/notification/notification.controller";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return notificationController.markRead(req, ctx);
}
