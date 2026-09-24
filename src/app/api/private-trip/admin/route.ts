import { privateTripController } from "@/modules/private-trip/private-trip.controller";
import { NextRequest } from "next/server";
import { requireAdmin } from "@/shared/auth";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return privateTripController.listAdmin(req);
}
