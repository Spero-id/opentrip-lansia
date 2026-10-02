import { NextRequest, NextResponse } from "next/server";
import { promotionRepository } from "./promotion.repository";
import { toPublicError } from "@/lib/errors/to-public-error";

type IdParams = { params: Promise<{ id: string }> };

async function idOf(ctx: IdParams): Promise<string> {
  const { id } = await ctx.params;
  return id;
}

export const promotionController = {
  async list() {
    try {
      return NextResponse.json(await promotionRepository.findAll());
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async create(req: NextRequest) {
    try {
      const body = await req.json();
      return NextResponse.json(await promotionRepository.create(body), { status: 201 });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async get(_req: NextRequest, ctx: IdParams) {
    try {
      const data = await promotionRepository.findById(await idOf(ctx));
      if (!data) return NextResponse.json({ error: "Promo tidak ditemukan" }, { status: 404 });
      return NextResponse.json(data);
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async update(req: NextRequest, ctx: IdParams) {
    try {
      const body = await req.json();
      await promotionRepository.update(await idOf(ctx), body);
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async remove(_req: NextRequest, ctx: IdParams) {
    try {
      await promotionRepository.delete(await idOf(ctx));
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },
};
