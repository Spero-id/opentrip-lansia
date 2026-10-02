import { NextRequest } from "next/server";
import { checkoutReferralController } from "@/features/booking/checkout-referral.controller";

export async function POST(req: NextRequest) {
  return checkoutReferralController.validate(req);
}
