import { NextRequest, NextResponse } from "next/server";
import { blogRepository, blogService } from "@/modules/blog";
import { requireAdmin } from "@/shared/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await blogRepository.findById(id);
    if (!data) return NextResponse.json({ error: "Blog tidak ditemukan" }, { status: 404 });

    // Non-admin hanya boleh membaca blog published (tutup kebocoran draft)
    const denied = await requireAdmin(req);
    const isAdmin = !denied;
    if (!isAdmin && data.status !== "published") {
      return NextResponse.json({ error: "Blog tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await req.json();
    const data = await blogService.updateBlog(id, body);
    if (!data) return NextResponse.json({ error: "Blog tidak ditemukan" }, { status: 404 });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await params;
    await blogRepository.delete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
