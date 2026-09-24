import { NextRequest, NextResponse } from "next/server";
import { tripService } from "@/modules/trip/trip.service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
