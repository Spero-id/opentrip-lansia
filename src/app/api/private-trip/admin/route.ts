import { NextRequest } from "next/server";
import { privateTripController } from "@/modules/private-trip/private-trip.controller";

export async function GET(req: NextRequest) {
  return privateTripController.listAdmin(req);
}
