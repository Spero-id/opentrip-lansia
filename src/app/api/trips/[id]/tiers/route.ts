import { NextRequest } from "next/server";
import { tripController } from "@/features/trip/trip.controller";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return tripController.GETPublicTiers(req, ctx);
}
