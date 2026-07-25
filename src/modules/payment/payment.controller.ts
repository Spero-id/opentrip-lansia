import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "./payment.service";

export const paymentController = {
  async create(req: NextRequest) {
    try {
      const { bookingId, method, amount } = await req.json();
      const payment = await paymentService.createPayment(bookingId, method, amount);
      return NextResponse.json(payment);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  },
};
