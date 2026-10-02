import { NextRequest } from "next/server";
import { notificationController } from "@/features/notification/notification.controller";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return notificationController.list(req);
}
