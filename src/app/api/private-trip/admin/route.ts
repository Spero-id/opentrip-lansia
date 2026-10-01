import { privateTripController } from "@/features/private-trip/private-trip.controller";
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return privateTripController.listAdmin(req);
}
