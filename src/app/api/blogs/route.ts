import { NextRequest, NextResponse } from "next/server";
import { blogRepository, blogService } from "@/modules/blog";
import { db } from "@/shared/db";
import { users } from "@/modules/auth/auth.schema";
import { eq } from "drizzle-orm";
import { auth } from "@/modules/auth/auth.config";

async function resolveAuthorId(req: NextRequest): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (session?.user?.id) return session.user.id;
  } catch {
    // lanjut ke fallback
  }
  const [admin] = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")).limit(1);
  return admin?.id ?? null;
}

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
    const authorId = await resolveAuthorId(req);
    if (!authorId) {
      return NextResponse.json({ error: "Tidak ada admin untuk dijadikan author." }, { status: 400 });
    }
    const data = await blogService.createBlog(body, authorId);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
