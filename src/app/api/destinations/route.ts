import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import { sql, eq } from "drizzle-orm";
import { bookings } from "@/modules/booking/booking.schema";
import { masterRepository } from "@/modules/master";

async function getBookedCounts(): Promise<Record<string, number>> {
  const rows = await db
    .select({
      departureId: bookings.departureId,
      booked: sql<number>`coalesce(sum(${bookings.totalParticipants}), 0)::int`,
    })
    .from(bookings)
    .where(eq(bookings.status, "confirmed"))
    .groupBy(bookings.departureId);

  const map: Record<string, number> = {};
  for (const row of rows) {
    map[row.departureId] = row.booked;
  }
  return map;
}

export async function GET() {
  try {
    const data = await masterRepository.getDestinations();
    let booked: Record<string, number> = {};
    if (data.length > 0) {
      try {
        booked = await getBookedCounts();
      } catch (err) {
        console.error("Gagal menghitung bookedCount:", err);
      }
    }
    return NextResponse.json(
      data.map((d) => ({ ...d, bookedCount: booked[d.id] ?? 0 }))
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await masterRepository.createDestination(body);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
