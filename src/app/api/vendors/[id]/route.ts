import { NextRequest } from "next/server";
import { masterController } from "@/features/master/master.controller";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return masterController.getVendor(req, ctx);
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return masterController.updateVendor(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return masterController.deleteVendor(req, ctx);
}
