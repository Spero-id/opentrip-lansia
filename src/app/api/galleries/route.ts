import { NextRequest } from "next/server";
import { galleryController } from "@/features/trip/gallery.controller";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return galleryController.list();
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return galleryController.create(req);
}
