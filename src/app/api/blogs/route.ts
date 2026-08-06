import { NextRequest, NextResponse } from "next/server";
import { blogRepository, blogService } from "@/modules/blog";

export async function GET(req: NextRequest) {
  try {
    const publishedOnly = req.nextUrl.searchParams.get("published") === "1";
    const data = publishedOnly
      ? await blogService.getPublishedBlogs()
      : await blogRepository.findAll();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await blogRepository.create(body);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
