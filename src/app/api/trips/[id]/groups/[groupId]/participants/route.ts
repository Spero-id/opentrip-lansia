import { NextRequest, NextResponse } from "next/server";
import { tripService } from "@/modules/trip/trip.service";
import { requireAdmin } from "@/shared/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { groupId } = await params;
    const participants = await tripService.getGroupParticipants(groupId);
    return NextResponse.json(participants);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
