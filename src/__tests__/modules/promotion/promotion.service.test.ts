import { promotionService } from "@/modules/promotion/promotion.service";
import { promotionRepository } from "@/modules/promotion/promotion.repository";

jest.mock("@/modules/promotion/promotion.repository", () => ({
  promotionRepository: {
    findByCode: jest.fn(),
    incrementUsage: jest.fn(),
    recordUsage: jest.fn(),
  },
}));

describe("promotionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("applyPromo", () => {
    it("applies percentage discount", async () => {
      (promotionRepository.findByCode as jest.Mock).mockResolvedValue({
        id: "promo-1",
        type: "percentage",
        value: "10",
        maxDiscount: "50000",
        usageLimit: 100,
        usageCount: 5,
      });

      const result = await promotionService.applyPromo("PROMO10", "user-1", "booking-1", "1000000");

      expect(result.discount).toBe(50000);
      expect(result.total).toBe(950000);
      expect(promotionRepository.incrementUsage).toHaveBeenCalledWith("promo-1");
    });

    it("applies flat discount", async () => {
      (promotionRepository.findByCode as jest.Mock).mockResolvedValue({
        id: "promo-2",
        type: "flat",
        value: "25000",
        maxDiscount: null,
        usageLimit: null,
        usageCount: 0,
      });

      const result = await promotionService.applyPromo("FLAT25", "user-1", "booking-1", "1000000");

      expect(result.discount).toBe(25000);
      expect(result.total).toBe(975000);
    });

    it("throws for invalid promo code", async () => {
      (promotionRepository.findByCode as jest.Mock).mockResolvedValue(null);

      await expect(
        promotionService.applyPromo("INVALID", "user-1", "booking-1", "100000")
      ).rejects.toThrow("Kode promo tidak valid");
    });

    it("throws when usage limit exceeded", async () => {
      (promotionRepository.findByCode as jest.Mock).mockResolvedValue({
        id: "promo-1",
        type: "flat",
        value: "10000",
        maxDiscount: null,
        usageLimit: 5,
        usageCount: 5,
      });

      await expect(
        promotionService.applyPromo("LIMITED", "user-1", "booking-1", "100000")
      ).rejects.toThrow("Kuota promo habis");
    });
  });
});
