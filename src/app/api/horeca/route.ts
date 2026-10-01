import { NextRequest, NextResponse } from "next/server";
import { masterRepository } from "@/features/master";
import { requireAdmin } from "@/lib/auth";
import { toPublicError } from "@/lib/errors/to-public-error";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  try {
    const data = await masterRepository.getHorecaList();
    return NextResponse.json(data);
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const data = await masterRepository.createHoreca(body);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
