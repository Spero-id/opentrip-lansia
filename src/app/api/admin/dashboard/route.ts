import { NextRequest, NextResponse } from "next/server";
import { dashboardService } from "@/modules/booking/dashboard.service";
import { requireAdmin } from "@/shared/auth";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const [stats, recentBookings] = await Promise.all([
      dashboardService.getStats(),
      dashboardService.getRecentBookings(),
    ]);
    return NextResponse.json({ stats, recentBookings });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
