import { NextRequest } from "next/server";
import { tripController } from "@/modules/trip/trip.controller";
import { requireAdmin } from "@/shared/auth";

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "true";
  if (all) {
    const denied = await requireAdmin(req);
    if (denied) return denied;
  }
  return tripController.GET(req);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return tripController.POST(req);
}