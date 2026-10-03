import { NextRequest } from "next/server";
import { blogController } from "@/features/blog/blog.controller";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return blogController.deleteCategory(req, ctx);
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return blogController.updateCategory(req, ctx);
}
