import { NextRequest, NextResponse } from "next/server";
import { tripService } from "@/features/trip/trip.service";
import { requireAdmin } from "@/lib/auth";
import { toPublicError } from "@/shared/errors/to-public-error";

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
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
