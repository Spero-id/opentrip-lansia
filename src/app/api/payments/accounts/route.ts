import { NextResponse } from "next/server";
import { paymentService } from "@/modules/payment/payment.service";
import { toPublicError } from "@/shared/errors/to-public-error";

export async function GET() {
  try {
    const accounts = await paymentService.getActiveAccounts();
    return NextResponse.json(accounts);
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
