import { NextRequest } from "next/server";
import { referralController } from "@/features/referral/referral.controller";

export async function GET(req: NextRequest) {
  return referralController.userHistory(req);
}
