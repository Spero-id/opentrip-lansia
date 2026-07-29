import { NextResponse } from "next/server";
import { masterRepository } from "@/modules/master";

export async function GET() {
  try {
    const data = await masterRepository.getHorecaTypes();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
