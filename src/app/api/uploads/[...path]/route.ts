import { NextRequest } from "next/server";
import { uploadController } from "@/features/upload/upload.controller";

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return uploadController.serve(req, ctx);
}
