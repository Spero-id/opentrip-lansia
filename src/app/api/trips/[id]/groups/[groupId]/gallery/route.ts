import { NextRequest, NextResponse } from "next/server";
import { tripRepository } from "@/modules/trip/trip.repository";
import { requireAdmin } from "@/shared/auth";
import { db } from "@/shared/db";
import { tripGalleries, galleryMedia } from "@/modules/trip/trip.schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  try {
    const { groupId } = await params;

    // Find gallery for this group
    const [gallery] = await db
      .select()
      .from(tripGalleries)
      .where(eq(tripGalleries.departureId, groupId))
      .limit(1);

    if (!gallery) {
      return NextResponse.json({ gallery: null, media: [] });
    }

    // Get media for this gallery
    const media = await db
      .select()
      .from(galleryMedia)
      .where(eq(galleryMedia.galleryId, gallery.id));

    return NextResponse.json({ gallery, media });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
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

    // Check if gallery already exists for this group
    const [existing] = await db
      .select()
      .from(tripGalleries)
      .where(eq(tripGalleries.departureId, groupId))
      .limit(1);

    if (existing) {
      return NextResponse.json(existing);
    }

    // Create new gallery
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
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
