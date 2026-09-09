import { NextRequest, NextResponse } from "next/server";
import { tripService } from "@/modules/trip/trip.service";
import { requireAdmin } from "@/shared/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await tripService.getTripGroups(id);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await requireAdmin(req);
    if (denied) return denied;

    const { id } = await params;
    const body = await req.json();

    // Validate required fields
    if (!body.startDate || !body.endDate) {
      return NextResponse.json(
        { error: "Tanggal berangkat dan pulang wajib diisi" },
        { status: 400 }
      );
    }
    if (!body.maxParticipants || body.maxParticipants < 1) {
      return NextResponse.json(
        { error: "Kuota maksimal minimal 1" },
        { status: 400 }
      );
    }
    const group = await tripService.createGroup(id, {
      startDate: body.startDate,
      endDate: body.endDate,
      maxParticipants: body.maxParticipants,
      minParticipants: body.minParticipants ?? 1,
      notes: body.notes,
    });

    return NextResponse.json(group, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
