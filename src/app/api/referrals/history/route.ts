import { NextRequest } from "next/server";
import { referralController } from "@/features/referral/referral.controller";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return referralController.history();
}
