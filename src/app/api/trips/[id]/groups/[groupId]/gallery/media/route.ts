import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/shared/auth";
import { db } from "@/shared/db";
import { galleryMedia } from "@/modules/trip/trip.schema";
import { tripGalleries } from "@/modules/trip/trip.schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  try {
    const denied = await requireAdmin(req);
    if (denied) return denied;

    const { groupId } = await params;
    const body = await req.json();

    if (!body.mediaId) {
      return NextResponse.json({ error: "mediaId wajib diisi" }, { status: 400 });
    }

    // Find gallery for this group
    const [gallery] = await db
      .select()
      .from(tripGalleries)
      .where(eq(tripGalleries.departureId, groupId))
      .limit(1);

    if (!gallery) {
      return NextResponse.json({ error: "Galeri tidak ditemukan" }, { status: 404 });
    }

    // Get max sort order
    const [maxSort] = await db
      .select({ maxSort: galleryMedia.sortOrder })
      .from(galleryMedia)
      .where(eq(galleryMedia.galleryId, gallery.id))
      .orderBy(galleryMedia.sortOrder)
      .limit(1);

    const nextSort = (maxSort?.maxSort ?? -1) + 1;

    // Add media to gallery
    const [media] = await db
      .insert(galleryMedia)
      .values({
        galleryId: gallery.id,
        mediaId: body.mediaId,
        uploadedBy: "admin",
        sortOrder: nextSort,
      })
      .returning();

    return NextResponse.json({ media }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
