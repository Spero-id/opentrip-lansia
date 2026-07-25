import { NextRequest, NextResponse } from "next/server";
import { reviewController } from "@/modules/review/review.controller";
import { reviewRepository } from "@/modules/review/review.repository";

export async function GET() {
  const list = await reviewRepository.findAll();
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  return reviewController.create(req);
}
