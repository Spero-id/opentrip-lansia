import { NextRequest } from "next/server";
import { dashboardController } from "@/features/booking/dashboard.controller";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return dashboardController.overview();
}
