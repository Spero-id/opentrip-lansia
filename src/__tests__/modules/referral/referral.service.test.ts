import { referralService } from "@/modules/referral/referral.service";
import { referralRepository } from "@/modules/referral/referral.repository";

jest.mock("@/modules/referral/referral.repository", () => ({
  referralRepository: {
    getCommissionsByAgent: jest.fn(),
  },
}));

describe("referralService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAgentCommissions", () => {
    it("returns commissions for agent", async () => {
      const commissions = [{ id: "c1", amount: "150000" }];
      (referralRepository.getCommissionsByAgent as jest.Mock).mockResolvedValue(commissions);

      const result = await referralService.getAgentCommissions("agent-1");
      expect(result).toEqual(commissions);
    });
  });
});
