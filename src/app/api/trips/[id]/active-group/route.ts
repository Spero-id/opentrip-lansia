import { NextRequest, NextResponse } from "next/server";
import { tripService } from "@/features/trip/trip.service";
import { requireAdmin } from "@/shared/auth";
import { toPublicError } from "@/shared/errors/to-public-error";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  try {
    const { id } = await params;
    const activeGroup = await tripService.getActiveGroupInfo(id);

    if (!activeGroup) {
      return NextResponse.json(
        { error: "Tidak ada grup aktif untuk trip ini" },
        { status: 404 }
      );
    }

    return NextResponse.json(activeGroup);
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
