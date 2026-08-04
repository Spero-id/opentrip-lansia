import { privateTripController } from "@/modules/private-trip/private-trip.controller";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  return privateTripController.createProposal(req, { params });
}
