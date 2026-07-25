import { GET, PUT, DELETE } from "@/app/api/reviews/[id]/route";
import { reviewRepository } from "@/modules/review/review.repository";

jest.mock("@/modules/review/review.repository", () => ({
  reviewRepository: {
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("GET /api/reviews/[id]", () => {
  it("returns review when found", async () => {
    const review = { id: "r1", rating: 5 };
    (reviewRepository.findById as jest.Mock).mockResolvedValue(review);

    const req = new Request("http://localhost:3000/api/reviews/r1");
    const response = await GET(req, { params: Promise.resolve({ id: "r1" }) });
    const data = await response.json();
    expect(data).toEqual(review);
  });

  it("returns 404 when not found", async () => {
    (reviewRepository.findById as jest.Mock).mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/reviews/nonexistent");
    const response = await GET(req, { params: Promise.resolve({ id: "nonexistent" }) });
    expect(response.status).toBe(404);
  });
});

describe("PUT /api/reviews/[id]", () => {
  it("updates review", async () => {
    const req = new Request("http://localhost:3000/api/reviews/r1", {
      method: "PUT",
      body: JSON.stringify({ status: "approved" }),
    });
    const response = await PUT(req, { params: Promise.resolve({ id: "r1" }) });
    const data = await response.json();
    expect(data).toEqual({ message: "updated" });
  });
});

describe("DELETE /api/reviews/[id]", () => {
  it("deletes review", async () => {
    const req = new Request("http://localhost:3000/api/reviews/r1", { method: "DELETE" });
    const response = await DELETE(req, { params: Promise.resolve({ id: "r1" }) });
    const data = await response.json();
    expect(data).toEqual({ message: "deleted" });
  });
});
