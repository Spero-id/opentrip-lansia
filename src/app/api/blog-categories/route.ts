import { NextRequest } from "next/server";
import { blogController } from "@/features/blog/blog.controller";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  return blogController.listCategories();
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return blogController.createCategory(req);
}
