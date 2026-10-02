import { NextRequest } from "next/server";
import { uploadController } from "@/features/upload/upload.controller";

export async function POST(req: NextRequest) {
  return uploadController.proofUpload(req);
}

export async function DELETE(req: NextRequest) {
  return uploadController.proofDelete(req);
}
