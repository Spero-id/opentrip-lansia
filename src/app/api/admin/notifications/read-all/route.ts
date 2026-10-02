import { NextRequest } from "next/server";
import { notificationController } from "@/features/notification/notification.controller";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return notificationController.markAllRead(req);
}
