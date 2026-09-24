import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir, access } from "fs/promises";
import path from "path";
import { auth } from "@/modules/auth/auth.config";
import { detectImageKind, extensionForImage } from "@/shared/utils/image-guard";

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "File kosong." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Ukuran file maksimal 5MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const kind = detectImageKind(buffer);
    if (!kind) {
      return NextResponse.json(
        { error: "File tidak valid. Gunakan gambar JPG, PNG, WEBP, GIF, atau AVIF." },
        { status: 400 }
      );
    }

    const ext = extensionForImage(buffer) || ".jpg";
    const safeName = `payment-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const dir = path.join(process.cwd(), "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, safeName), buffer);

    return NextResponse.json({ url: `/api/uploads/${safeName}` });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan saat upload.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = req.nextUrl.searchParams.get("url") || "";
    if (!url.startsWith("/api/uploads/payment-") || url.includes("..")) {
      return NextResponse.json({ error: "URL tidak valid." }, { status: 400 });
    }
    const filename = url.replace("/api/uploads/", "");
    const filePath = path.join(process.cwd(), "uploads", filename);
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!filePath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: "URL tidak valid." }, { status: 400 });
    }

    try {
      await access(filePath);
    } catch {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 404 });
    }

    await unlink(filePath);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus file.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
