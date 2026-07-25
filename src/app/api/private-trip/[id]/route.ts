import { NextRequest } from "next/server";
import { privateTripController } from "@/modules/private-trip/private-trip.controller";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return privateTripController.getById(req, { params: { id } });
}