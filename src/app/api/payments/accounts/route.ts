import { NextResponse } from "next/server";
import { paymentService } from "@/features/payment/payment.service";
import { toPublicError } from "@/shared/errors/to-public-error";
import { isCompleteAccount } from "@/shared/payment/payment-account";

export async function GET() {
  try {
    const accounts = await paymentService.getActiveAccounts();
    const usable = accounts.filter((a) => isCompleteAccount(a));
    return NextResponse.json(usable);
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
