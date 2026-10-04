import { NextRequest, NextResponse } from "next/server";
import { authService } from "./auth.service";
import { auth } from "./auth.config";
import { toPublicError } from "@/utils/errors/to-public-error";

type IdParams = { params: Promise<{ id: string }> };

async function idOf(ctx: IdParams): Promise<string> {
  const { id } = await ctx.params;
  return id;
}

export const userController = {
  async list() {
    try {
      return NextResponse.json(await authService.getAllUsers());
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async update(req: NextRequest, ctx: IdParams) {
    try {
      const id = await idOf(ctx);
      const body = await req.json();
      const session = await auth.api.getSession({ headers: req.headers });
      if (session?.user && session.user.id === id && body.role && body.role !== session.user.role) {
        return NextResponse.json({ error: "Tidak dapat mengubah role akun sendiri" }, { status: 400 });
      }
      await authService.updateUser(id, body, session?.user?.id ?? null);
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async remove(req: NextRequest, ctx: IdParams) {
    try {
      const id = await idOf(ctx);
      const session = await auth.api.getSession({ headers: req.headers });
      if (session?.user && session.user.id === id) {
        return NextResponse.json({ error: "Tidak dapat menghapus akun sendiri" }, { status: 400 });
      }
      await authService.deleteUser(id, session?.user?.id ?? null);
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },
};
