import { NextRequest, NextResponse } from "next/server";
import { promotionRepository } from "./promotion.repository";
import { toPublicError } from "@/utils/errors/to-public-error";
import { auditService, diffFields, pickFields } from "@/features/audit";
import { getSessionUser } from "@/lib/auth";

type IdParams = { params: Promise<{ id: string }> };

const PROMO_AUDIT_FIELDS = ["code", "name", "type", "value", "isActive", "startDate", "endDate"] as const;

async function idOf(ctx: IdParams): Promise<string> {
  const { id } = await ctx.params;
  return id;
}

async function actorId(req: NextRequest): Promise<string | null> {
  return (await getSessionUser(req))?.id ?? null;
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
      const created = await promotionRepository.create(body);
      await auditService.record({
        adminId: await actorId(req),
        action: "create",
        entityType: "promotion",
        entityId: created.id,
        newValues: pickFields(created, PROMO_AUDIT_FIELDS),
        description: `Promo "${created.code}" dibuat`,
      });
      return NextResponse.json(created, { status: 201 });
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
      const id = await idOf(ctx);
      const body = await req.json();
      const before = await promotionRepository.findById(id);
      await promotionRepository.update(id, body);
      const after = await promotionRepository.findById(id);
      const changes = diffFields(before, after, PROMO_AUDIT_FIELDS);
      if (Object.keys(changes).length > 0) {
        await auditService.record({
          adminId: await actorId(req),
          action: "update",
          entityType: "promotion",
          entityId: id,
          oldValues: pickFields(before, PROMO_AUDIT_FIELDS),
          newValues: changes,
          description: `Promo "${after?.code ?? id}" diperbarui`,
        });
      }
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async remove(req: NextRequest, ctx: IdParams) {
    try {
      const id = await idOf(ctx);
      const before = await promotionRepository.findById(id);
      await promotionRepository.delete(id);
      if (before) {
        await auditService.record({
          adminId: await actorId(req),
          action: "delete",
          entityType: "promotion",
          entityId: id,
          oldValues: pickFields(before, PROMO_AUDIT_FIELDS),
          newValues: null,
          description: `Promo "${before.code}" dihapus`,
        });
      }
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },
};
