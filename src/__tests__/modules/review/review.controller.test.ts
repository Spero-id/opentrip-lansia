import { NextRequest } from "next/server";
import { reviewController } from "@/modules/review/review.controller";
import { reviewService } from "@/modules/review/review.service";

jest.mock("@/modules/review/review.service", () => ({
  reviewService: {
    createReview: jest.fn(),
  },
}));

describe("reviewController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("creates review with isVerifiedPurchase default", async () => {
      const review = { id: "r1", rating: 5, isVerifiedPurchase: false };
      (reviewService.createReview as jest.Mock).mockResolvedValue(review);

      const req = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        body: JSON.stringify({ bookingId: "b1", userId: "u1", tripId: "t1", rating: 5, content: "Great!" }),
      });

      const response = await reviewController.create(req);
      const data = await response.json();

      expect(reviewService.createReview).toHaveBeenCalledWith(
        expect.objectContaining({ isVerifiedPurchase: false })
      );
      expect(data).toEqual(review);
    });
  });
});
