import { NextRequest } from "next/server";
import { privateTripController } from "@/modules/private-trip/private-trip.controller";

export async function POST(req: NextRequest) {
  return privateTripController.create(req);
}

export async function GET(req: NextRequest) {
  return privateTripController.listByUser(req);
}
