import { NextRequest, NextResponse } from "next/server";
import { blogRepository } from "./blog.repository";
import { blogService } from "./blog.service";
import { auth } from "../auth/auth.config";
import { toPublicError } from "@/lib/errors/to-public-error";

type IdParams = { params: Promise<{ id: string }> };

async function idOf(ctx: IdParams): Promise<string> {
  const { id } = await ctx.params;
  return id;
}

export const blogController = {
  async listPublished() {
    try {
      return NextResponse.json(await blogService.getPublishedBlogs());
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async listAll() {
    try {
      return NextResponse.json(await blogRepository.findAll());
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async getByIdForViewer(_req: NextRequest, ctx: IdParams, isAdmin: boolean) {
    try {
      const data = await blogRepository.findById(await idOf(ctx));
      if (!data) return NextResponse.json({ error: "Blog tidak ditemukan" }, { status: 404 });
      if (!isAdmin && data.status !== "published") {
        return NextResponse.json({ error: "Blog tidak ditemukan" }, { status: 404 });
      }
      return NextResponse.json(data);
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async createBlog(req: NextRequest) {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const body = await req.json();
      return NextResponse.json(await blogService.createBlog(body, session.user.id), { status: 201 });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async updateBlog(req: NextRequest, ctx: IdParams) {
    try {
      const body = await req.json();
      const data = await blogService.updateBlog(await idOf(ctx), body);
      if (!data) return NextResponse.json({ error: "Blog tidak ditemukan" }, { status: 404 });
      return NextResponse.json(data);
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async deleteBlog(_req: NextRequest, ctx: IdParams) {
    try {
      await blogRepository.delete(await idOf(ctx));
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },
};
