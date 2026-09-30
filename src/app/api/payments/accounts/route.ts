import { NextResponse } from "next/server";
import { paymentService } from "@/modules/payment/payment.service";
import { toPublicError } from "@/shared/errors/to-public-error";
import { isCompleteAccount } from "@/shared/payment/payment-account";

export async function GET() {
  try {
    const accounts = await paymentService.getActiveAccounts();
    // Saring rekening yang belum lengkap (mis. nomor kosong) supaya client
    // tidak pernah diberi rekening tanpa nomor — opsi bank disembunyikan.
    const usable = accounts.filter((a) => isCompleteAccount(a));
    return NextResponse.json(usable);
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
