import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "./booking.service";

export const bookingController = {
  async create(req: NextRequest) {
    try {
      const body = await req.json();
      const { departureId, items, participants } = body;
      const userId = req.headers.get("x-user-id") || "00000000-0000-0000-0000-000000000000";

      const booking = await bookingService.createBooking(userId, departureId, items, participants);
      return NextResponse.json(booking);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  },
};
