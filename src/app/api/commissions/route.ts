import { NextRequest, NextResponse } from "next/server";
import { referralRepository } from "@/modules/referral/referral.repository";

export async function GET() {
  const list = await referralRepository.findAllCommissions();
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const commission = await referralRepository.createCommission(body);
  return NextResponse.json(commission, { status: 201 });
}
