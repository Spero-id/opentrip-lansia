import { NextRequest, NextResponse } from "next/server";
import { promotionRepository } from "@/modules/promotion";
import { requireAdmin, requireSession } from "@/shared/auth";
import { toPublicError } from "@/shared/errors/to-public-error";

export async function GET(req: NextRequest) {
  // Daftar promo dipakai checkout (voucher) → wajib login; halaman admin juga login.
  const denied = await requireSession(req);
  if (denied) return denied;
  try {
    const data = await promotionRepository.findAll();
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
    const data = await promotionRepository.create(body);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
