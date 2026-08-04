import { privateTripController } from "@/modules/private-trip/private-trip.controller";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return privateTripController.listAdmin(req);
}
