import { NextRequest, NextResponse } from "next/server";
import { tripService } from "@/modules/trip/trip.service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const participants = await tripService.getGroupParticipants(groupId);
    return NextResponse.json(participants);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
