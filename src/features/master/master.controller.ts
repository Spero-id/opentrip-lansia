import { NextRequest, NextResponse } from "next/server";
import { masterRepository } from "./master.repository";
import { toPublicError } from "@/utils/errors/to-public-error";

type IdParams = { params: Promise<{ id: string }> };

async function idOf(ctx: IdParams): Promise<string> {
  const { id } = await ctx.params;
  return id;
}

export const masterController = {
  async listHoreca() {
    try {
      return NextResponse.json(await masterRepository.getHorecaList());
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async createHoreca(req: NextRequest) {
    try {
      const body = await req.json();
      return NextResponse.json(await masterRepository.createHoreca(body), { status: 201 });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async getHoreca(_req: NextRequest, ctx: IdParams) {
    try {
      const data = await masterRepository.getHorecaById(await idOf(ctx));
      if (!data) return NextResponse.json({ error: "HORECA tidak ditemukan" }, { status: 404 });
      return NextResponse.json(data);
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async updateHoreca(req: NextRequest, ctx: IdParams) {
    try {
      const body = await req.json();
      const data = await masterRepository.updateHoreca(await idOf(ctx), body);
      if (!data) return NextResponse.json({ error: "HORECA tidak ditemukan" }, { status: 404 });
      return NextResponse.json(data);
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async deleteHoreca(_req: NextRequest, ctx: IdParams) {
    try {
      await masterRepository.deleteHoreca(await idOf(ctx));
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async listVendors() {
    try {
      return NextResponse.json(await masterRepository.getVendors());
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async createVendor(req: NextRequest) {
    try {
      const body = await req.json();
      return NextResponse.json(await masterRepository.createVendor(body), { status: 201 });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async getVendor(_req: NextRequest, ctx: IdParams) {
    try {
      const data = await masterRepository.getVendorById(await idOf(ctx));
      if (!data) return NextResponse.json({ error: "Vendor tidak ditemukan" }, { status: 404 });
      return NextResponse.json(data);
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async updateVendor(req: NextRequest, ctx: IdParams) {
    try {
      const body = await req.json();
      const data = await masterRepository.updateVendor(await idOf(ctx), body);
      if (!data) return NextResponse.json({ error: "Vendor tidak ditemukan" }, { status: 404 });
      return NextResponse.json(data);
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async deleteVendor(_req: NextRequest, ctx: IdParams) {
    try {
      await masterRepository.deleteVendor(await idOf(ctx));
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async listHorecaTypes() {
    try {
      return NextResponse.json(await masterRepository.getHorecaTypes());
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async listVendorTypes() {
    try {
      return NextResponse.json(await masterRepository.getVendorTypes());
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async listCategories() {
    try {
      return NextResponse.json(await masterRepository.getDestinationCategories());
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async createCategory(req: NextRequest) {
    try {
      const body = await req.json();
      if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });
      }
      return NextResponse.json(await masterRepository.createDestinationCategory(body.name.trim()));
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },
};
