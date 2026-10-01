import { NextResponse } from "next/server";
import { masterRepository } from "@/features/master";
import { toPublicError } from "@/shared/errors/to-public-error";

export async function GET() {
  try {
    const data = await masterRepository.getHorecaTypes();
    return NextResponse.json(data);
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
