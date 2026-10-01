import { NextRequest, NextResponse } from "next/server";
import { tripRepository } from "@/features/trip";
import { requireAdmin } from "@/lib/auth";
import { toPublicError } from "@/lib/errors/to-public-error";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  try {
    const data = await tripRepository.findAllGalleries();
    return NextResponse.json(data);
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const data = await tripRepository.createGallery(body);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
