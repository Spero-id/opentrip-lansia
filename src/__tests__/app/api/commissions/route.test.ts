import { GET, POST } from "@/app/api/commissions/route";
import { referralRepository } from "@/modules/referral/referral.repository";

jest.mock("@/modules/referral/referral.repository", () => ({
  referralRepository: {
    findAllCommissions: jest.fn(),
    createCommission: jest.fn(),
  },
}));

describe("GET /api/commissions", () => {
  it("returns all commissions", async () => {
    const commissions = [{ id: "c1", amount: "150000" }];
    (referralRepository.findAllCommissions as jest.Mock).mockResolvedValue(commissions);

    const response = await GET();
    const data = await response.json();
    expect(data).toEqual(commissions);
  });
});

describe("POST /api/commissions", () => {
  it("creates commission", async () => {
    const commission = { id: "c1", agentId: "a1", amount: "150000" };
    (referralRepository.createCommission as jest.Mock).mockResolvedValue(commission);

    const req = new Request("http://localhost:3000/api/commissions", {
      method: "POST",
      body: JSON.stringify({ agentId: "a1", bookingId: "b1", amount: "150000" }),
    });
    const response = await POST(req as any);
    const data = await response.json();
    expect(data).toEqual(commission);
  });
});
