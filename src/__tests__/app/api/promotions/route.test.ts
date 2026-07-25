import { GET, POST } from "@/app/api/promotions/route";
import { promotionRepository } from "@/modules/promotion/promotion.repository";

jest.mock("@/modules/promotion/promotion.repository", () => ({
  promotionRepository: {
    findAll: jest.fn(),
    create: jest.fn(),
  },
}));

describe("GET /api/promotions", () => {
  it("returns all promotions", async () => {
    const promos = [{ id: "p1", code: "PROMO" }];
    (promotionRepository.findAll as jest.Mock).mockResolvedValue(promos);

    const response = await GET();
    const data = await response.json();
    expect(data).toEqual(promos);
  });
});

describe("POST /api/promotions", () => {
  it("creates a promotion", async () => {
    const promo = { id: "p1", code: "NEWPROMO" };
    (promotionRepository.create as jest.Mock).mockResolvedValue(promo);

    const req = new Request("http://localhost:3000/api/promotions", {
      method: "POST",
      body: JSON.stringify({ code: "NEWPROMO", type: "flat", value: "10000" }),
    });
    const response = await POST(req as any);
    const data = await response.json();
    expect(data).toEqual(promo);
    expect(response.status).toBe(201);
  });
});
