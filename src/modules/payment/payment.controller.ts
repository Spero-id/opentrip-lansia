import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "./payment.service";
import { toPublicError } from "@/shared/errors/to-public-error";

export const paymentController = {
  async create(req: NextRequest) {
    try {
      const { bookingId, method, amount } = await req.json();
      const payment = await paymentService.createPayment(bookingId, method, amount);
      return NextResponse.json(payment);
    } catch (err) {
      const message = toPublicError(err, "Terjadi kesalahan");
      return NextResponse.json({ error: message }, { status: 400 });
    }
  },
};
