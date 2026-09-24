import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/shared/auth";
import { db } from "@/shared/db";
import { galleryMedia } from "@/modules/trip/trip.schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string; mediaId: string }> }
) {
  try {
    const denied = await requireAdmin(_req);
    if (denied) return denied;

    const { mediaId } = await params;

    await db.delete(galleryMedia).where(eq(galleryMedia.id, mediaId));

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
