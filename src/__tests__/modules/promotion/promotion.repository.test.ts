import { db } from "@/shared/db";
import { promotionRepository } from "@/modules/promotion/promotion.repository";

describe("promotionRepository", () => {
  const mockDb = jest.mocked(db);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("returns all promotions", async () => {
      const chain = {
        from: jest.fn(() => ({
          orderBy: jest.fn(() => Promise.resolve([])),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await promotionRepository.findAll();
      expect(result).toEqual([]);
    });
  });

  describe("findByCode", () => {
    it("returns active promo by code", async () => {
      const promo = { id: "p1", code: "PROMO" };
      const chain = {
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([promo])),
          })),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await promotionRepository.findByCode("PROMO");
      expect(result).toEqual(promo);
    });
  });

  describe("create", () => {
    it("inserts and returns promotion", async () => {
      const promo = { id: "p1", code: "NEW" };
      const chain = {
        values: jest.fn(() => ({
          returning: jest.fn(() => Promise.resolve([promo])),
        })),
      };
      (mockDb.insert as jest.Mock).mockReturnValue(chain);

      const result = await promotionRepository.create(promo as any);
      expect(result).toEqual(promo);
    });
  });

  describe("update", () => {
    it("updates promotion", async () => {
      const chain = {
        set: jest.fn(() => ({
          where: jest.fn(() => Promise.resolve()),
        })),
      };
      (mockDb.update as jest.Mock).mockReturnValue(chain);

      await promotionRepository.update("p1", { isActive: false });
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("deletes promotion", async () => {
      const chain = {
        where: jest.fn(() => Promise.resolve()),
      };
      (mockDb.delete as jest.Mock).mockReturnValue(chain);

      await promotionRepository.delete("p1");
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });

  describe("incrementUsage", () => {
    it("increments usage count", async () => {
      const chain = {
        set: jest.fn(() => ({
          where: jest.fn(() => Promise.resolve()),
        })),
      };
      (mockDb.update as jest.Mock).mockReturnValue(chain);

      await promotionRepository.incrementUsage("p1");
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe("recordUsage", () => {
    it("records usage entry", async () => {
      const chain = {
        values: jest.fn(() => Promise.resolve()),
      };
      (mockDb.insert as jest.Mock).mockReturnValue(chain);

      await promotionRepository.recordUsage("p1", "u1", "b1");
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });
});
