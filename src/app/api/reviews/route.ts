import { NextRequest, NextResponse } from "next/server";
import { reviewRepository } from "@/modules/review";

export async function GET() {
  try {
    const data = await reviewRepository.findAll();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await reviewRepository.create({ ...body, isVerifiedPurchase: false });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
