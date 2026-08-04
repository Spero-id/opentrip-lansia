import { privateTripController } from "@/modules/private-trip/private-trip.controller";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  return privateTripController.getAdminDetail(req, { params });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  return privateTripController.updateRequestStatus(req, { params });
}
