import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { lookup } from "mrmime";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const filename = segments.join("/");

  // Prevent path traversal
  if (filename.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const filePath = path.join(UPLOADS_DIR, filename);

  // Ensure the resolved path is within UPLOADS_DIR
  if (!filePath.startsWith(UPLOADS_DIR)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    await stat(filePath);
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const buffer = await readFile(filePath);
  const mime = lookup(filePath) || "application/octet-stream";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
