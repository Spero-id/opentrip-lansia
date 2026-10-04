import { NextRequest, NextResponse } from "next/server";
import { tripService } from "./trip.service";
import { tripRepository } from "./trip.repository";
import { auth } from "@/features/auth/auth.config";
import { ConflictError, NotFoundError } from "@/utils/errors/app-error";

async function actorId(req: NextRequest): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
import { bookings } from "@/db/schema/bookings";
import { tripGalleries, galleryMedia } from "@/db/schema/trips";
import { media } from "@/db/schema/master";
import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { toPublicError } from "@/utils/errors/to-public-error";

type TripParams = { params: Promise<{ id: string }> };
type GroupParams = { params: Promise<{ id: string; groupId: string }> };
type MediaParams = { params: Promise<{ id: string; groupId: string; mediaId: string }> };
type TripGroupParams = GroupParams;
type PriceParams = { params: Promise<{ id: string; groupId: string; priceId: string }> };

function priceErrorStatus(err: unknown): number {
  if (err instanceof NotFoundError) return 404;
  if (err instanceof ConflictError) return 409;
  return 400;
}

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
      }, await actorId(req));
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
      }, await actorId(req));
      return NextResponse.json(group);
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async remove(req: NextRequest, ctx: GroupParams) {
    try {
      const { groupId } = await ctx.params;
      await tripService.deleteGroup(groupId, await actorId(req));
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async activate(req: NextRequest, ctx: GroupParams) {
    try {
      const { id, groupId } = await ctx.params;
      const result = await tripService.activateGroup(id, groupId, await actorId(req));
      return NextResponse.json({ success: true, activatedGroupId: result.activated, deactivatedGroupId: result.deactivated });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async complete(req: NextRequest, ctx: GroupParams) {
    try {
      const { id: tripId, groupId } = await ctx.params;
      const group = await tripRepository.findGroupById(groupId);
      if (!group || group.tripId !== tripId) {
        return NextResponse.json({ error: "Grup tidak ditemukan" }, { status: 404 });
      }
      await tripService.completeGroup(groupId, await actorId(req));
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

  async listPrices(_req: NextRequest, ctx: GroupParams) {
    try {
      const { groupId } = await ctx.params;
      const [tiers, stats] = await Promise.all([
        tripService.getPricesByDeparture(groupId),
        tripService.getTierStats(groupId),
      ]);
      return NextResponse.json(
        tiers.map((t) => ({ ...t, bookings: stats[t.id]?.bookings ?? 0, revenue: stats[t.id]?.revenue ?? 0 })),
      );
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async priceHistory(_req: NextRequest, ctx: GroupParams) {
    try {
      const { groupId } = await ctx.params;
      return NextResponse.json(await tripService.getPriceHistory(groupId));
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async createPrice(req: NextRequest, ctx: TripGroupParams) {
    try {
      const { id: tripId, groupId } = await ctx.params;
      const body = await req.json();
      const data = await tripService.createPrice(tripId, groupId, {
        name: body.name,
        price: body.price,
        quota: Number(body.quota),
        validFrom: body.validFrom || null,
        validUntil: body.validUntil || null,
        isActive: body.isActive ?? true,
      }, await actorId(req));
      return NextResponse.json(data, { status: 201 });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: priceErrorStatus(err) });
    }
  },

  async updatePrice(req: NextRequest, ctx: PriceParams) {
    try {
      const { id: tripId, groupId, priceId } = await ctx.params;
      const body = await req.json();
      const patch: Record<string, unknown> = {};
      if (body.name !== undefined) patch.name = body.name;
      if (body.price !== undefined) patch.price = body.price;
      if (body.quota !== undefined) patch.quota = Number(body.quota);
      if (body.validFrom !== undefined) patch.validFrom = body.validFrom || null;
      if (body.validUntil !== undefined) patch.validUntil = body.validUntil || null;
      if (body.isActive !== undefined) patch.isActive = Boolean(body.isActive);
      const data = await tripService.updatePrice(tripId, groupId, priceId, patch, await actorId(req));
      if (!data) return NextResponse.json({ error: "Tier harga tidak ditemukan" }, { status: 404 });
      return NextResponse.json(data);
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: priceErrorStatus(err) });
    }
  },

  async deletePrice(req: NextRequest, ctx: PriceParams) {
    try {
      const { id: tripId, groupId, priceId } = await ctx.params;
      await tripService.deletePrice(tripId, groupId, priceId, await actorId(req));
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: priceErrorStatus(err) });
    }
  },
};
