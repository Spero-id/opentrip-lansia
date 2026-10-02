import { NextRequest } from "next/server";
import { reviewController } from "@/features/review/review.controller";
import { requireAdmin } from "@/lib/auth";

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return reviewController.update(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return reviewController.remove(req, ctx);
}
