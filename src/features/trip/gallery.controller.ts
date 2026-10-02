import { NextRequest, NextResponse } from "next/server";
import { tripRepository } from "./trip.repository";
import { toPublicError } from "@/lib/errors/to-public-error";

type IdParams = { params: Promise<{ id: string }> };

async function idOf(ctx: IdParams): Promise<string> {
  const { id } = await ctx.params;
  return id;
}

export const galleryController = {
  async list() {
    try {
      return NextResponse.json(await tripRepository.findAllGalleries());
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async create(req: NextRequest) {
    try {
      const body = await req.json();
      return NextResponse.json(await tripRepository.createGallery(body), { status: 201 });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async get(_req: NextRequest, ctx: IdParams) {
    try {
      const data = await tripRepository.findGalleryById(await idOf(ctx));
      if (!data) return NextResponse.json({ error: "Galeri tidak ditemukan" }, { status: 404 });
      return NextResponse.json(data);
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async update(req: NextRequest, ctx: IdParams) {
    try {
      const body = await req.json();
      await tripRepository.updateGallery(await idOf(ctx), body);
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async remove(_req: NextRequest, ctx: IdParams) {
    try {
      await tripRepository.deleteGallery(await idOf(ctx));
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },
};
