import { NextRequest } from "next/server";
import { checkoutController } from "@/features/booking/checkout.controller";

export async function POST(req: NextRequest) {
  return checkoutController.create(req);
}
