import { NextRequest, NextResponse } from "next/server";
import { promotionRepository } from "@/modules/promotion/promotion.repository";

export async function GET() {
  const list = await promotionRepository.findAll();
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const promo = await promotionRepository.create(body);
  return NextResponse.json(promo, { status: 201 });
}
