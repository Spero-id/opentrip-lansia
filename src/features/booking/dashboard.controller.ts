import { NextResponse } from "next/server";
import { dashboardService } from "./dashboard.service";
import { toPublicError } from "@/utils/errors/to-public-error";

export const dashboardController = {
  async overview() {
    try {
      const [stats, recentBookings] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentBookings(),
      ]);
      return NextResponse.json({ stats, recentBookings });
    } catch (e) {
      return NextResponse.json({ error: toPublicError(e, "Unknown error") }, { status: 500 });
    }
  },
};
