import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir, access, readFile, stat } from "fs/promises";
import path from "path";
import { lookup } from "mrmime";
import { auth } from "../auth/auth.config";
import { detectImageKind, extensionForImage } from "@/utils/image-guard";
import { db } from "@/lib/db";
import { media } from "@/db/schema/master";
import { toPublicError } from "@/lib/errors/to-public-error";

const MAX_SIZE = 5 * 1024 * 1024;
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

async function sessionUserId(req: NextRequest): Promise<string | null> {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user?.id ?? null;
}

function errorJson(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

async function saveBuffer(filename: string, buffer: Buffer): Promise<void> {
  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(path.join(UPLOADS_DIR, filename), buffer);
}

function resolveUploadPath(url: string, prefix: string): string | null {
  if (!url.startsWith(prefix) || url.includes("..")) return null;
  const filePath = path.join(process.cwd(), "uploads", url.replace("/api/uploads/", ""));
  if (!filePath.startsWith(UPLOADS_DIR)) return null;
  return filePath;
}

export const uploadController = {
  async adminUpload(req: NextRequest) {
    try {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return errorJson("File tidak ditemukan.", 400);
      if (file.size === 0) return errorJson("File kosong.", 400);
      if (file.size > MAX_SIZE) return errorJson("Ukuran file maksimal 5MB.", 400);
      const buffer = Buffer.from(await file.arrayBuffer());
      const kind = detectImageKind(buffer);
      if (!kind) {
        return errorJson("File tidak valid. Gunakan gambar JPG, PNG, WEBP, GIF, atau AVIF.", 400);
      }
      const ext = extensionForImage(buffer) || ".jpg";
      const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      await saveBuffer(safeName, buffer);
      const [mediaRecord] = await db
        .insert(media)
        .values({ filename: file.name, url: `/api/uploads/${safeName}`, type: kind, fileSize: file.size })
        .returning();
      return NextResponse.json({ id: mediaRecord.id, url: `/api/uploads/${safeName}` });
    } catch (err) {
      return errorJson(toPublicError(err, "Terjadi kesalahan saat upload."), 500);
    }
  },

  async adminDelete(req: NextRequest) {
    try {
      const url = req.nextUrl.searchParams.get("url") || "";
      const filePath = resolveUploadPath(url, "/api/uploads/");
      if (!filePath) return errorJson("URL tidak valid.", 400);
      try {
        await access(filePath);
      } catch {
        return errorJson("File tidak ditemukan.", 404);
      }
      await unlink(filePath);
      return NextResponse.json({ success: true });
    } catch (err) {
      return errorJson(toPublicError(err, "Terjadi kesalahan saat menghapus file."), 500);
    }
  },

  async proofUpload(req: NextRequest) {
    try {
      const userId = await sessionUserId(req);
      if (!userId) return errorJson("Unauthorized", 401);
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return errorJson("File tidak ditemukan.", 400);
      if (file.size === 0) return errorJson("File kosong.", 400);
      if (file.size > MAX_SIZE) return errorJson("Ukuran file maksimal 5MB.", 400);
      const buffer = Buffer.from(await file.arrayBuffer());
      const kind = detectImageKind(buffer);
      if (!kind) {
        return errorJson("File tidak valid. Gunakan gambar JPG, PNG, WEBP, GIF, atau AVIF.", 400);
      }
      const ext = extensionForImage(buffer) || ".jpg";
      const safeName = `payment-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      await saveBuffer(safeName, buffer);
      return NextResponse.json({ url: `/api/uploads/${safeName}` });
    } catch (err) {
      return errorJson(toPublicError(err, "Terjadi kesalahan saat upload."), 500);
    }
  },

  async proofDelete(req: NextRequest) {
    try {
      const userId = await sessionUserId(req);
      if (!userId) return errorJson("Unauthorized", 401);
      const url = req.nextUrl.searchParams.get("url") || "";
      const filePath = resolveUploadPath(url, "/api/uploads/payment-");
      if (!filePath) return errorJson("URL tidak valid.", 400);
      try {
        await access(filePath);
      } catch {
        return errorJson("File tidak ditemukan.", 404);
      }
      await unlink(filePath);
      return NextResponse.json({ success: true });
    } catch (err) {
      return errorJson(toPublicError(err, "Terjadi kesalahan saat menghapus file."), 500);
    }
  },

  async serve(_req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
    const { path: segments } = await ctx.params;
    const filename = segments.join("/");
    if (filename.includes("..")) return errorJson("Path tidak valid", 400);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (!filePath.startsWith(UPLOADS_DIR)) return errorJson("Path tidak valid", 400);
    try {
      await stat(filePath);
    } catch {
      return errorJson("File tidak ditemukan", 404);
    }
    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: { "Content-Type": lookup(filePath) || "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  },
};
