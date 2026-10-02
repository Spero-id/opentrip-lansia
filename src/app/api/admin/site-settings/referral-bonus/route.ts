import { NextRequest } from "next/server";
import { siteSettingsController } from "@/features/site-settings/site-settings.controller";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return siteSettingsController.getReferralBonus();
}
