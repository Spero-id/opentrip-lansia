import { NextRequest, NextResponse } from "next/server";
import { tripService } from "./trip.service";
import { slugify } from "@/shared/utils/helpers";

// --- Next.js Route Handlers ---

export async function GET(req: NextRequest) {
  try {
    const all = req.nextUrl.searchParams.get("all") === "true";
    const trips = all ? await tripService.getAllTrips() : await tripService.getPublishedTrips();
    return NextResponse.json(trips);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GETById(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const trip = await tripService.getTripWithDepartures(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(trip);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = body.slug || slugify(body.title) + "-" + Date.now();
    const trip = await tripService.createTrip({ ...body, slug });
    return NextResponse.json(trip, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const trip = await tripService.updateTrip(id, body);
    if (!trip) {
      return NextResponse.json({ error: "Trip tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(trip);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await tripService.deleteTrip(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// --- Object-style export for compatibility ---

export const tripController = { GET, GETById, POST, PUT, DELETE };
