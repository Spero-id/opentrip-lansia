import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "./booking.service";
import { auth } from "../auth/auth.config";

// --- Next.js Route Handlers ---

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const bookings =
      session.user.role === "admin"
        ? await bookingService.getAllBookings()
        : await bookingService.getUserBookings(session.user.id, session.user.email);
    return NextResponse.json(bookings);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { departureId, items, participants } = body;
    const userId = req.headers.get("x-user-id") || "00000000-0000-0000-0000-000000000000";

    const booking = await bookingService.createBooking(userId, departureId, items, participants);
    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// --- Object-style export for compatibility ---

export const bookingController = { GET, POST };
