import { NextRequest, NextResponse } from "next/server";
import { blogRepository } from "@/modules/blog/blog.repository";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const blog = await blogRepository.findById(id);
  if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(blog);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  await blogRepository.update(id, body);
  return NextResponse.json({ message: "updated" });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await blogRepository.delete(id);
  return NextResponse.json({ message: "deleted" });
}
