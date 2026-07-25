import { GET, PUT, DELETE } from "@/app/api/promotions/[id]/route";
import { promotionRepository } from "@/modules/promotion/promotion.repository";

jest.mock("@/modules/promotion/promotion.repository", () => ({
  promotionRepository: {
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("GET /api/promotions/[id]", () => {
  it("returns promotion when found", async () => {
    const promo = { id: "p1", code: "PROMO" };
    (promotionRepository.findById as jest.Mock).mockResolvedValue(promo);

    const req = new Request("http://localhost:3000/api/promotions/p1");
    const response = await GET(req, { params: Promise.resolve({ id: "p1" }) });
    const data = await response.json();
    expect(data).toEqual(promo);
  });

  it("returns 404 when not found", async () => {
    (promotionRepository.findById as jest.Mock).mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/promotions/nonexistent");
    const response = await GET(req, { params: Promise.resolve({ id: "nonexistent" }) });
    expect(response.status).toBe(404);
  });
});

describe("PUT /api/promotions/[id]", () => {
  it("updates promotion", async () => {
    const req = new Request("http://localhost:3000/api/promotions/p1", {
      method: "PUT",
      body: JSON.stringify({ isActive: false }),
    });
    const response = await PUT(req, { params: Promise.resolve({ id: "p1" }) });
    const data = await response.json();
    expect(data).toEqual({ message: "updated" });
  });
});

describe("DELETE /api/promotions/[id]", () => {
  it("deletes promotion", async () => {
    const req = new Request("http://localhost:3000/api/promotions/p1", { method: "DELETE" });
    const response = await DELETE(req, { params: Promise.resolve({ id: "p1" }) });
    const data = await response.json();
    expect(data).toEqual({ message: "deleted" });
  });
});
