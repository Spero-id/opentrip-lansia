import { NextRequest, NextResponse } from "next/server";
import { tripService } from "./trip.service";
import { tripRepository } from "./trip.repository";
import { bookings } from "@/db/schema/bookings";
import { tripGalleries, galleryMedia } from "@/db/schema/trips";
import { media } from "@/db/schema/master";
import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { toPublicError } from "@/lib/errors/to-public-error";

type TripParams = { params: Promise<{ id: string }> };
type GroupParams = { params: Promise<{ id: string; groupId: string }> };
type MediaParams = { params: Promise<{ id: string; groupId: string; mediaId: string }> };

export const groupController = {
  async list(_req: NextRequest, ctx: TripParams) {
    try {
      const { id } = await ctx.params;
      return NextResponse.json(await tripService.getTripGroups(id));
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async create(req: NextRequest, ctx: TripParams) {
    try {
      const { id } = await ctx.params;
      const body = await req.json();
      if (!body.startDate || !body.endDate) {
        return NextResponse.json({ error: "Tanggal berangkat dan pulang wajib diisi" }, { status: 400 });
      }
      if (!body.maxParticipants || body.maxParticipants < 1) {
        return NextResponse.json({ error: "Kuota maksimal minimal 1" }, { status: 400 });
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
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async update(req: NextRequest, ctx: GroupParams) {
    try {
      const { groupId } = await ctx.params;
      const body = await req.json();
      const group = await tripService.updateGroup(groupId, {
        startDate: body.startDate,
        endDate: body.endDate,
        maxParticipants: body.maxParticipants,
        minParticipants: body.minParticipants,
        notes: body.notes,
      });
      return NextResponse.json(group);
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async remove(_req: NextRequest, ctx: GroupParams) {
    try {
      const { groupId } = await ctx.params;
      await tripService.deleteGroup(groupId);
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async activate(_req: NextRequest, ctx: GroupParams) {
    try {
      const { id, groupId } = await ctx.params;
      const result = await tripService.activateGroup(id, groupId);
      return NextResponse.json({ success: true, activatedGroupId: result.activated, deactivatedGroupId: result.deactivated });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async complete(_req: NextRequest, ctx: GroupParams) {
    try {
      const { id: tripId, groupId } = await ctx.params;
      const group = await tripRepository.findGroupById(groupId);
      if (!group || group.tripId !== tripId) {
        return NextResponse.json({ error: "Grup tidak ditemukan" }, { status: 404 });
      }
      await tripRepository.updateGroup(groupId, { status: "completed", isActive: false });
      await db
        .update(bookings)
        .set({ status: "completed", updatedAt: new Date() })
        .where(and(eq(bookings.departureId, groupId), eq(bookings.status, "confirmed")));
      return NextResponse.json({ success: true, message: "Grup telah ditandai selesai" });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async participants(_req: NextRequest, ctx: GroupParams) {
    try {
      const { groupId } = await ctx.params;
      return NextResponse.json(await tripService.getGroupParticipants(groupId));
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async getGallery(_req: NextRequest, ctx: GroupParams) {
    try {
      const { groupId } = await ctx.params;
      const [gallery] = await db.select().from(tripGalleries).where(eq(tripGalleries.departureId, groupId)).limit(1);
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
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async createGallery(req: NextRequest, ctx: GroupParams) {
    try {
      const { id: tripId, groupId } = await ctx.params;
      const body = await req.json();
      const [existing] = await db.select().from(tripGalleries).where(eq(tripGalleries.departureId, groupId)).limit(1);
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
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async attachMedia(req: NextRequest, ctx: GroupParams) {
    try {
      const { groupId } = await ctx.params;
      const body = await req.json();
      if (!body.mediaId) {
        return NextResponse.json({ error: "mediaId wajib diisi" }, { status: 400 });
      }
      const [gallery] = await db.select().from(tripGalleries).where(eq(tripGalleries.departureId, groupId)).limit(1);
      if (!gallery) {
        return NextResponse.json({ error: "Galeri tidak ditemukan" }, { status: 404 });
      }
      const [maxSort] = await db
        .select({ maxSort: galleryMedia.sortOrder })
        .from(galleryMedia)
        .where(eq(galleryMedia.galleryId, gallery.id))
        .orderBy(galleryMedia.sortOrder)
        .limit(1);
      const nextSort = (maxSort?.maxSort ?? -1) + 1;
      const [item] = await db
        .insert(galleryMedia)
        .values({ galleryId: gallery.id, mediaId: body.mediaId, uploadedBy: "admin", sortOrder: nextSort })
        .returning();
      return NextResponse.json({ media: item }, { status: 201 });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async detachMedia(_req: NextRequest, ctx: MediaParams) {
    try {
      const { mediaId } = await ctx.params;
      await db.delete(galleryMedia).where(eq(galleryMedia.id, mediaId));
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },
};
