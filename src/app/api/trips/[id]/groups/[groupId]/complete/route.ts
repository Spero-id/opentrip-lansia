import { NextRequest, NextResponse } from "next/server";
import { tripRepository } from "@/modules/trip/trip.repository";
import { bookings } from "@/modules/booking/booking.schema";
import { db } from "@/shared/db";
import { eq, and } from "drizzle-orm";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  try {
    const { id: tripId, groupId } = await params;

    // Verify group exists and belongs to trip
    const group = await tripRepository.findGroupById(groupId);
    if (!group || group.tripId !== tripId) {
      return NextResponse.json(
        { error: "Grup tidak ditemukan" },
        { status: 404 }
      );
    }

    // Update group status to completed
    await tripRepository.updateGroup(groupId, { status: "completed" });

    // Update all bookings for this departure to completed
    await db
      .update(bookings)
      .set({ status: "completed", updatedAt: new Date() })
      .where(
        and(
          eq(bookings.departureId, groupId),
          eq(bookings.status, "confirmed")
        )
      );

    return NextResponse.json({ success: true, message: "Grup telah ditandai selesai" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
