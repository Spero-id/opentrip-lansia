import { reviewService } from "@/modules/review/review.service";
import { reviewRepository } from "@/modules/review/review.repository";

jest.mock("@/modules/review/review.repository", () => ({
  reviewRepository: {
    create: jest.fn(),
  },
}));

describe("reviewService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createReview", () => {
    it("creates a review", async () => {
      const data = { bookingId: "b1", userId: "u1", tripId: "t1", rating: 5, content: "Great!" };
      const created = { id: "r1", ...data };
      (reviewRepository.create as jest.Mock).mockResolvedValue(created);

      const result = await reviewService.createReview(data);
      expect(result).toEqual(created);
      expect(reviewRepository.create).toHaveBeenCalledWith(data);
    });
  });
});
