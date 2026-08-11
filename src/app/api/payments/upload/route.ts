import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir, access } from "fs/promises";
import path from "path";
import { auth } from "@/modules/auth/auth.config";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_SIZE = 5 * 1024 * 1024;

function isAllowedImage(buf: Buffer): boolean {
  if (buf.length < 12) return false;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true; // JPEG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true; // PNG
  if (buf.toString("latin1", 0, 4) === "GIF8") return true; // GIF
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf.toString("latin1", 8, 12) === "WEBP"
  ) return true; // WEBP
  if (buf.toString("latin1", 4, 8) === "ftyp") return true; // AVIF/HEIC container
  return false;
}

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
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Tipe file tidak didukung. Gunakan JPG, PNG, WEBP, GIF, atau AVIF." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Ukuran file maksimal 5MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!isAllowedImage(buffer)) {
      return NextResponse.json({ error: "File tidak valid. Gunakan gambar JPG, PNG, WEBP, GIF, atau AVIF." }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase() || ".jpg";
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const dir = path.join(process.cwd(), "public", "payments");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, safeName), buffer);

    return NextResponse.json({ url: `/payments/${safeName}` });
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
    if (!url.startsWith("/payments/") || url.includes("..")) {
      return NextResponse.json({ error: "URL tidak valid." }, { status: 400 });
    }
    const filePath = path.join(process.cwd(), "public", url);
    const paymentsDir = path.join(process.cwd(), "public", "payments");
    if (!filePath.startsWith(paymentsDir)) {
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
