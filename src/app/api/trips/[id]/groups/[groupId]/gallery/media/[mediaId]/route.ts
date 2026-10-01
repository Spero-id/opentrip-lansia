import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/shared/db";
import { galleryMedia } from "@/db/schema/trips";
import { eq } from "drizzle-orm";
import { toPublicError } from "@/shared/errors/to-public-error";

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
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
