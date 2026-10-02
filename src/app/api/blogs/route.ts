import { NextRequest } from "next/server";
import { blogController } from "@/features/blog/blog.controller";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  const isAdmin = !denied;
  const publishedOnly = req.nextUrl.searchParams.get("published") === "1";
  if (publishedOnly || !isAdmin) return blogController.listPublished();
  return blogController.listAll();
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return blogController.createBlog(req);
}
