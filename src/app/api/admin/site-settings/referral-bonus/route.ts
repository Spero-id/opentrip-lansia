import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/shared/auth";
import { siteSettingsService } from "@/modules/site-settings/site-settings.service";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const points = await siteSettingsService.getReferralBonusPoints();
    return NextResponse.json({ referralBonusPoints: points });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
