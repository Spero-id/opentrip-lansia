import { NextRequest } from "next/server";
import { tripController } from "@/modules/trip/trip.controller";

export async function GET() {
  return tripController.list();
}

export async function POST(req: NextRequest) {
  return tripController.create(req);
}
