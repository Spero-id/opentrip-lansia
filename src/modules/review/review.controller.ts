import { NextRequest, NextResponse } from "next/server";
import { reviewService } from "./review.service";

export const reviewController = {
  async create(req: NextRequest) {
    const body = await req.json();
    const review = await reviewService.createReview({
      ...body,
      isVerifiedPurchase: false,
    });
    return NextResponse.json(review);
  },
};
