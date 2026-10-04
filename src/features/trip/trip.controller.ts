import { NextRequest, NextResponse } from "next/server";
import { tripService } from "./trip.service";
import { tripRepository } from "./trip.repository";
import { slugify } from "@/utils/helpers";
import { toPublicError } from "@/utils/errors/to-public-error";
import { getSessionUser } from "@/lib/auth";

async function actorId(req: NextRequest): Promise<string | null> {
  return (await getSessionUser(req))?.id ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const all = req.nextUrl.searchParams.get("all") === "true";
    const featured = req.nextUrl.searchParams.get("featured") === "true";
    const trips = all
      ? await tripService.getAllTrips()
      : featured
      ? await tripService.getFeaturedTrips()
      : await tripService.getPublishedTrips();
    return NextResponse.json(trips);
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
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
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = body.slug || slugify(body.title) + "-" + Date.now();
    const trip = await tripService.createTrip({ ...body, slug }, await actorId(req));
    return NextResponse.json(trip, { status: 201 });
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const trip = await tripService.updateTrip(id, body, await actorId(req));
    if (!trip) {
      return NextResponse.json({ error: "Trip tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(trip);
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await tripService.deleteTrip(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GETPublicTiers(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const trip = await tripService.getTripWithDepartures(id);
    if (!trip || trip.status !== "published") {
      return NextResponse.json({ error: "Trip tidak ditemukan" }, { status: 404 });
    }
    const departures = trip.departures ?? [];
    if (departures.length === 0) {
      return NextResponse.json({ departureId: null, tiers: [] });
    }
    const activeGroup = await tripRepository.findActiveGroupByTripId(id);
    const active = departures.find((d) => d.id === activeGroup?.id)
      ?? [...departures].sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)))[0];
    const tiers = await tripService.getPricesByDeparture(active.id);
    const today = new Date().toISOString().slice(0, 10);
    return NextResponse.json({
      departureId: active.id,
      tiers: tiers
        .filter((t) => t.isActive !== false)
        .filter((t) => {
          if (t.validFrom && today < t.validFrom) return false;
          if (t.validUntil && today > t.validUntil) return false;
          return true;
        })
        .map((t) => ({
          id: t.id,
          name: t.name,
          price: t.price,
          quota: t.quota,
          remaining: Math.max((t.quota ?? 0) - (t.quotaBooked ?? 0), 0),
          validFrom: t.validFrom,
          validUntil: t.validUntil,
        })),
    });
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const tripController = { GET, GETById, GETPublicTiers, POST, PUT, DELETE };
