import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireSession } from "@/shared/auth";
import { db } from "@/shared/db";
import { tripGalleries, galleryMedia } from "@/db/schema/trips";
import { media } from "@/db/schema/master";
import { eq } from "drizzle-orm";
import { toPublicError } from "@/shared/errors/to-public-error";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  const denied = await requireSession(req);
  if (denied) return denied;
  try {
    const { groupId } = await params;

    const [gallery] = await db
      .select()
      .from(tripGalleries)
      .where(eq(tripGalleries.departureId, groupId))
      .limit(1);

    if (!gallery) {
      return NextResponse.json({ gallery: null, media: [] });
    }

    const mediaItems = await db
      .select({
        id: galleryMedia.id,
        galleryId: galleryMedia.galleryId,
        mediaId: galleryMedia.mediaId,
        uploadedBy: galleryMedia.uploadedBy,
        sortOrder: galleryMedia.sortOrder,
        createdAt: galleryMedia.createdAt,
        url: media.url,
      })
      .from(galleryMedia)
      .leftJoin(media, eq(galleryMedia.mediaId, media.id))
      .where(eq(galleryMedia.galleryId, gallery.id));

    return NextResponse.json({ gallery, media: mediaItems });
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  try {
    const denied = await requireAdmin(req);
    if (denied) return denied;

    const { id: tripId, groupId } = await params;
    const body = await req.json();

    const [existing] = await db
      .select()
      .from(tripGalleries)
      .where(eq(tripGalleries.departureId, groupId))
      .limit(1);

    if (existing) {
      return NextResponse.json(existing);
    }

    const [gallery] = await db
      .insert(tripGalleries)
      .values({
        tripId,
        departureId: groupId,
        title: body.title || `Foto Trip Grup`,
        description: body.description || null,
        isPrivate: body.isPrivate ?? false,
      })
      .returning();

    return NextResponse.json({ gallery }, { status: 201 });
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
