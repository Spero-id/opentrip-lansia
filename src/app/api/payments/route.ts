import { NextRequest } from "next/server";
import { paymentController } from "@/modules/payment/payment.controller";

export async function POST(req: NextRequest) {
  return paymentController.create(req);
}
