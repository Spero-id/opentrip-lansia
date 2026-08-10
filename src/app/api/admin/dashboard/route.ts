import { NextResponse } from "next/server";
import { dashboardService } from "@/modules/booking/dashboard.service";

export async function GET() {
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
