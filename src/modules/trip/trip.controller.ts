import { NextRequest, NextResponse } from "next/server";
import { tripService } from "./trip.service";
import { slugify } from "@/shared/utils/helpers";

export const tripController = {
  async list() {
    const trips = await tripService.getAllTrips();
    return NextResponse.json(trips);
  },

  async create(req: NextRequest) {
    const body = await req.json();
    const slug = body.slug || slugify(body.title) + "-" + Date.now();
    const trip = await tripService.createTrip({ ...body, slug });
    return NextResponse.json(trip, { status: 201 });
  },
};
