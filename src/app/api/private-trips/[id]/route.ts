import { privateTripController } from "@/features/private-trip/private-trip.controller";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  return privateTripController.getById(req, { params });
}
