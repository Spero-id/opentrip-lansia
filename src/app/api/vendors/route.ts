import { NextRequest, NextResponse } from "next/server";
import { masterRepository } from "@/modules/master/master.repository";

export async function GET() {
  const list = await masterRepository.getVendors();
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = await masterRepository.createVendor(body);
  return NextResponse.json(item, { status: 201 });
}
