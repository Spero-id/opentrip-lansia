import { NextRequest, NextResponse } from "next/server";
import { referralRepository } from "@/modules/referral/referral.repository";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const commission = await referralRepository.findCommissionById(id);
  if (!commission) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(commission);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  await referralRepository.updateCommission(id, body);
  return NextResponse.json({ message: "updated" });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await referralRepository.deleteCommission(id);
  return NextResponse.json({ message: "deleted" });
}
