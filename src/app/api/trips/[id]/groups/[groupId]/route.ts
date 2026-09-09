import { NextRequest, NextResponse } from "next/server";
import { tripService } from "@/modules/trip/trip.service";
import { requireAdmin } from "@/shared/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  try {
    const denied = await requireAdmin(req);
    if (denied) return denied;

    const { groupId } = await params;
    const body = await req.json();

    const group = await tripService.updateGroup(groupId, {
      startDate: body.startDate,
      endDate: body.endDate,
      maxParticipants: body.maxParticipants,
      minParticipants: body.minParticipants,
      notes: body.notes,
    });

    return NextResponse.json(group);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  try {
    const denied = await requireAdmin(_req);
    if (denied) return denied;

    const { groupId } = await params;
    await tripService.deleteGroup(groupId);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
