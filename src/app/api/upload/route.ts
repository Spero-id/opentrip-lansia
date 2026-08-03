import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Tipe file tidak didukung. Gunakan JPG, PNG, WEBP, GIF, AVIF, atau SVG." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Ukuran file maksimal 5MB." }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase() || ".jpg";
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, safeName), Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({ url: `/uploads/${safeName}` });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan saat upload.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url") || "";
    if (!url.startsWith("/uploads/") || url.includes("..")) {
      return NextResponse.json({ error: "URL tidak valid." }, { status: 400 });
    }
    const filePath = path.join(process.cwd(), "public", url);
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!filePath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: "URL tidak valid." }, { status: 400 });
    }
    await unlink(filePath);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
