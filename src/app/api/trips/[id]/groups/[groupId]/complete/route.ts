import { NextRequest, NextResponse } from "next/server";
import { tripRepository } from "@/features/trip/trip.repository";
import { bookings } from "@/db/schema/bookings";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { toPublicError } from "@/lib/errors/to-public-error";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { id: tripId, groupId } = await params;

    const group = await tripRepository.findGroupById(groupId);
    if (!group || group.tripId !== tripId) {
      return NextResponse.json(
        { error: "Grup tidak ditemukan" },
        { status: 404 }
      );
    }

    await tripRepository.updateGroup(groupId, { status: "completed", isActive: false });

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
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
