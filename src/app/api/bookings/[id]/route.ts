import { NextRequest } from "next/server";
import { bookingController } from "@/features/booking/booking.controller";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return bookingController.GETById(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return bookingController.PATCHStatus(req, ctx);
}
