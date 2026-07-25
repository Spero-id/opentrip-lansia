import { GET, PUT, DELETE } from "@/app/api/commissions/[id]/route";
import { referralRepository } from "@/modules/referral/referral.repository";

jest.mock("@/modules/referral/referral.repository", () => ({
  referralRepository: {
    findCommissionById: jest.fn(),
    updateCommission: jest.fn(),
    deleteCommission: jest.fn(),
  },
}));

describe("GET /api/commissions/[id]", () => {
  it("returns commission when found", async () => {
    const comm = { id: "c1", amount: "150000" };
    (referralRepository.findCommissionById as jest.Mock).mockResolvedValue(comm);

    const req = new Request("http://localhost:3000/api/commissions/c1");
    const response = await GET(req, { params: Promise.resolve({ id: "c1" }) });
    const data = await response.json();
    expect(data).toEqual(comm);
  });

  it("returns 404 when not found", async () => {
    (referralRepository.findCommissionById as jest.Mock).mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/commissions/nonexistent");
    const response = await GET(req, { params: Promise.resolve({ id: "nonexistent" }) });
    expect(response.status).toBe(404);
  });
});

describe("PUT /api/commissions/[id]", () => {
  it("updates commission", async () => {
    const req = new Request("http://localhost:3000/api/commissions/c1", {
      method: "PUT",
      body: JSON.stringify({ status: "paid" }),
    });
    const response = await PUT(req, { params: Promise.resolve({ id: "c1" }) });
    const data = await response.json();
    expect(data).toEqual({ message: "updated" });
  });
});

describe("DELETE /api/commissions/[id]", () => {
  it("deletes commission", async () => {
    const req = new Request("http://localhost:3000/api/commissions/c1", { method: "DELETE" });
    const response = await DELETE(req, { params: Promise.resolve({ id: "c1" }) });
    const data = await response.json();
    expect(data).toEqual({ message: "deleted" });
  });
});
