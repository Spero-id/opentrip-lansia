import { NextResponse } from "next/server";
import { masterRepository } from "@/modules/master/master.repository";

export async function GET() {
  const list = await masterRepository.getHorecaTypes();
  return NextResponse.json(list);
}
