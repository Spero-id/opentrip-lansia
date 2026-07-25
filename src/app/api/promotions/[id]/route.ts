import { NextRequest, NextResponse } from "next/server";
import { promotionRepository } from "@/modules/promotion/promotion.repository";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const promo = await promotionRepository.findById(id);
  if (!promo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(promo);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  await promotionRepository.update(id, body);
  return NextResponse.json({ message: "updated" });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await promotionRepository.delete(id);
  return NextResponse.json({ message: "deleted" });
}
