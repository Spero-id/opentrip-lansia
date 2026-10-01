import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/shared/auth";
import { siteSettingsService } from "@/features/site-settings/site-settings.service";
import { toPublicError } from "@/shared/errors/to-public-error";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const points = await siteSettingsService.getReferralBonusPoints();
    return NextResponse.json({ referralBonusPoints: points });
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
