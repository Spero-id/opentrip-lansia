import { NextRequest } from "next/server";
import { userController } from "@/features/auth/user.controller";
import { requireAdmin } from "@/lib/auth";

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return userController.update(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return userController.remove(req, ctx);
}
