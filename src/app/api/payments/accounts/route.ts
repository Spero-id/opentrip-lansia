import { paymentController } from "@/features/payment/payment.controller";

export async function GET() {
  return paymentController.listAccounts();
}
