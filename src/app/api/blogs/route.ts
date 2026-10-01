import { NextRequest, NextResponse } from "next/server";
import { blogRepository, blogService } from "@/features/blog";
import { auth } from "@/features/auth/auth.config";
import { requireAdmin } from "@/lib/auth";
import { toPublicError } from "@/lib/errors/to-public-error";

export async function GET(req: NextRequest) {
  try {
    const denied = await requireAdmin(req);
    const isAdmin = !denied;
    const publishedOnly = req.nextUrl.searchParams.get("published") === "1";
    const data =
      publishedOnly || !isAdmin
        ? await blogService.getPublishedBlogs()
        : await blogRepository.findAll();
    return NextResponse.json(data);
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const data = await blogService.createBlog(body, session.user.id);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
