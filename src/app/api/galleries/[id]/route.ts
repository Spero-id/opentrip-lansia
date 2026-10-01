import { NextRequest, NextResponse } from "next/server";
import { tripRepository } from "@/features/trip";
import { requireAdmin } from "@/lib/auth";
import { toPublicError } from "@/lib/errors/to-public-error";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  try {
    const { id } = await params;
    const data = await tripRepository.findGalleryById(id);
    if (!data) return NextResponse.json({ error: "Galeri tidak ditemukan" }, { status: 404 });
    return NextResponse.json(data);
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await req.json();
    await tripRepository.updateGallery(id, body);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await params;
    await tripRepository.deleteGallery(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
