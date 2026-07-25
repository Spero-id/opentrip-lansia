import { NextRequest } from "next/server";
import { bookingController } from "@/modules/booking/booking.controller";

export async function POST(req: NextRequest) {
  return bookingController.create(req);
}
