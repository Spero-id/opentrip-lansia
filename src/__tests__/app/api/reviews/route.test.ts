import { GET, POST } from "@/app/api/reviews/route";
import { reviewRepository } from "@/modules/review/review.repository";
import { reviewController } from "@/modules/review/review.controller";

jest.mock("@/modules/review/review.repository", () => ({
  reviewRepository: {
    findAll: jest.fn(),
  },
}));

jest.mock("@/modules/review/review.controller", () => ({
  reviewController: {
    create: jest.fn(),
  },
}));

describe("GET /api/reviews", () => {
  it("returns all reviews", async () => {
    const reviews = [{ id: "r1", rating: 5 }];
    (reviewRepository.findAll as jest.Mock).mockResolvedValue(reviews);

    const response = await GET();
    const data = await response.json();
    expect(data).toEqual(reviews);
  });
});

describe("POST /api/reviews", () => {
  it("delegates to reviewController.create", async () => {
    const mockResponse = new Response(JSON.stringify({ id: "r1" }));
    (reviewController.create as jest.Mock).mockResolvedValue(mockResponse);

    const req = new Request("http://localhost:3000/api/reviews", {
      method: "POST",
      body: JSON.stringify({ bookingId: "b1", rating: 5 }),
    });
    const response = await POST(req as any);
    const data = await response.json();
    expect(data).toEqual({ id: "r1" });
  });
});
