import { referralRepository } from "./referral.repository";

export const referralService = {
  async getAgentCommissions(agentId: string) {
    return referralRepository.getCommissionsByAgent(agentId);
  },
};
