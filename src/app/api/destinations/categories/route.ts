import { NextRequest, NextResponse } from "next/server";
import { masterRepository } from "@/modules/master";
import { requireAdmin } from "@/shared/auth";

export async function GET() {
  try {
    const data = await masterRepository.getDestinationCategories();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });
    }
    const category = await masterRepository.createDestinationCategory(body.name.trim());
    return NextResponse.json(category);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
