import { NextRequest } from "next/server";
import { uploadController } from "@/features/upload/upload.controller";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return uploadController.adminUpload(req);
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return uploadController.adminDelete(req);
}
