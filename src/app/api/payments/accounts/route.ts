import { NextResponse } from "next/server";
import { paymentService } from "@/modules/payment/payment.service";

export async function GET() {
  try {
    const accounts = await paymentService.getActiveAccounts();
    return NextResponse.json(accounts);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
