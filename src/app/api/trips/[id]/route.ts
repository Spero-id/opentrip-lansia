import { NextRequest, NextResponse } from "next/server";
import { tripService } from "@/modules/trip/trip.service";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const trip = await tripService.updateTrip(id, body);
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(trip);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await tripService.deleteTrip(id);
  return NextResponse.json({ message: "deleted" });
}
