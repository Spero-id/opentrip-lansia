import { NextRequest, NextResponse } from "next/server";
import { tripService } from "@/features/trip/trip.service";
import { requireAdmin } from "@/lib/auth";
import { toPublicError } from "@/lib/errors/to-public-error";

export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  try {
    const denied = await requireAdmin(_req);
    if (denied) return denied;

    const { id, groupId } = await params;
    const result = await tripService.activateGroup(id, groupId);

    return NextResponse.json({
      success: true,
      activatedGroupId: result.activated,
      deactivatedGroupId: result.deactivated,
    });
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
