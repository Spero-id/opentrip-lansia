import { NextRequest } from "next/server";
import { paymentController } from "@/features/payment/payment.controller";

export async function POST(req: NextRequest, ctx: { params: Promise<{ paymentId: string }> }) {
  return paymentController.review(req, ctx);
}
