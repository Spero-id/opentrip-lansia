import { privateTripRepository } from "./private-trip.repository";

type RequestStatus = "draft" | "submitted" | "reviewed" | "approved" | "rejected" | "revision";
type ProposalStatus = "pending" | "accepted" | "rejected" | "revised";

/** Valid request status transitions keyed by [currentStatus][action] */
const REQUEST_TRANSITIONS: Record<string, Record<string, RequestStatus>> = {
  submitted: { review: "reviewed", propose: "reviewed", reject: "rejected" },
  reviewed: { approve: "approved", reject: "rejected", request_revision: "revision" },
  revision: { propose: "reviewed", reject: "rejected" },
};

const PROPOSAL_TRANSITIONS: Record<string, Record<string, ProposalStatus>> = {
  pending: { accept: "accepted", reject: "rejected", revise: "revised" },
  revised: { accept: "accepted", reject: "rejected" },
};

function isValidTransition<T extends string>(transitions: Record<string, Record<string, T>>, current: string, action: string): T | null {
  return transitions[current]?.[action] ?? null;
}

export const privateTripService = {
  async submitRequest(userId: string, data: {
    title: string;
    durationDays: number;
    participantsCount: number;
    destinationPreferences?: string;
    specialRequirements?: string;
    budgetEstimate?: string;
  }) {
    return privateTripRepository.create({
      ...data,
      budgetEstimate: data.budgetEstimate || null,
      userId,
      status: "submitted",
      submittedAt: new Date(),
    });
  },

  async findByUserId(userId: string) {
    return privateTripRepository.findByUserId(userId);
  },

  async findById(id: string) {
    return privateTripRepository.findById(id);
  },

  async findAll(options?: { status?: string; search?: string; limit?: number; offset?: number }) {
    return privateTripRepository.findAll(options);
  },

  async updateStatus(id: string, action: string) {
    const req = await privateTripRepository.findById(id);
    if (!req) throw new Error("Request not found");

    const newStatus = isValidTransition(REQUEST_TRANSITIONS, req.status, action);
    if (!newStatus) throw new Error(`Cannot perform "${action}" on request with status "${req.status}"`);

    const terminal = ["approved", "rejected"];
    if (terminal.includes(req.status)) throw new Error(`Cannot change status of ${req.status} requests`);

    return privateTripRepository.updateStatus(id, newStatus);
  },

  async createProposal(requestId: string, adminId: string, data: {
    proposalContent: string;
    estimatedPrice: string;
    inclusions: string;
    exclusions: string;
  }) {
    const prop = await privateTripRepository.createProposal({
      requestId,
      adminId,
      ...data,
      estimatedPrice: data.estimatedPrice || null,
      status: "pending",
    });

    const req = await privateTripRepository.findById(requestId);
    if (req && req.status === "submitted") {
      await privateTripRepository.updateStatus(requestId, "reviewed");
    }

    return prop;
  },

  async findProposalsByRequestId(requestId: string) {
    return privateTripRepository.findProposalsByRequestId(requestId);
  },

  async respondToProposal(requestId: string, proposalId: string, userId: string, action: string) {
    const req = await privateTripRepository.findById(requestId);
    if (!req) throw new Error("Request not found");
    if (req.userId !== userId) throw new Error("Unauthorized");

    if (action !== "accept" && action !== "reject" && action !== "revise") {
      throw new Error(`Invalid action: ${action}`);
    }

    const requestAction = action === "accept" ? "approve" : action === "reject" ? "reject" : "request_revision";
    const newReqStatus = isValidTransition(REQUEST_TRANSITIONS, req.status, requestAction);

    const prop = await privateTripRepository.findProposalById(proposalId);
    if (!prop) throw new Error("Proposal not found");
    if (prop.status !== "pending" && prop.status !== "revised") throw new Error("Proposal is not actionable");

    const newPropStatus = isValidTransition(PROPOSAL_TRANSITIONS, prop.status, action);
    if (!newPropStatus) throw new Error(`Cannot "${action}" proposal with status "${prop.status}"`);

    if (newReqStatus) {
      await privateTripRepository.updateStatus(requestId, newReqStatus);
    }
    return privateTripRepository.updateProposalStatus(proposalId, newPropStatus);
  },
};
