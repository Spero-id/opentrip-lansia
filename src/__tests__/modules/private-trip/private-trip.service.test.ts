import { privateTripService } from "@/modules/private-trip/private-trip.service";
import { privateTripRepository } from "@/modules/private-trip/private-trip.repository";

jest.mock("@/modules/private-trip/private-trip.repository", () => ({
  privateTripRepository: {
    create: jest.fn(),
    findByUserId: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    updateStatus: jest.fn(),
    createProposal: jest.fn(),
    findProposalsByRequestId: jest.fn(),
    findProposalById: jest.fn(),
    updateProposalStatus: jest.fn(),
  },
}));

describe("privateTripService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("submitRequest", () => {
    it("creates private trip request with submitted status", async () => {
      const created = { id: "req-1", status: "submitted" };
      (privateTripRepository.create as jest.Mock).mockResolvedValue(created);

      const result = await privateTripService.submitRequest("user-1", {
        title: "Custom Trip",
        durationDays: 5,
        participantsCount: 4,
        destinationPreferences: "Bali",
        budgetEstimate: "5000000",
      });

      expect(privateTripRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          title: "Custom Trip",
          status: "submitted",
        })
      );
      expect(result).toEqual(created);
    });
  });

  describe("updateStatus", () => {
    it("throws error for invalid transition", async () => {
      (privateTripRepository.findById as jest.Mock).mockResolvedValue({ id: "req-1", status: "approved" });
      await expect(privateTripService.updateStatus("req-1", "review")).rejects.toThrow("Cannot perform");
    });
  });
});
