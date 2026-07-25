import { NextRequest, NextResponse } from "next/server";
import { blogRepository } from "@/modules/blog/blog.repository";
import { slugify } from "@/shared/utils/helpers";

export async function GET() {
  const list = await blogRepository.findAll();
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const slug = body.slug || slugify(body.title) + "-" + Date.now();
  const authorId = body.authorId || req.headers.get("x-user-id") || "00000000-0000-0000-0000-000000000000";
  const blog = await blogRepository.create({ ...body, slug, authorId });
  return NextResponse.json(blog, { status: 201 });
}
