import { db } from "@/shared/db";
import { referralRepository } from "@/modules/referral/referral.repository";

describe("referralRepository", () => {
  const mockDb = jest.mocked(db);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createReferral", () => {
    it("inserts and returns referral", async () => {
      const ref = { id: "r1", referrerId: "u1" };
      const chain = {
        values: jest.fn(() => ({
          returning: jest.fn(() => Promise.resolve([ref])),
        })),
      };
      (mockDb.insert as jest.Mock).mockReturnValue(chain);

      const result = await referralRepository.createReferral(ref as any);
      expect(result).toEqual(ref);
    });
  });

  describe("findByReferrer", () => {
    it("returns referrals by referrer", async () => {
      const refs = [{ id: "r1" }];
      const chain = {
        from: jest.fn(() => ({
          where: jest.fn(() => Promise.resolve(refs)),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await referralRepository.findByReferrer("u1");
      expect(result).toEqual(refs);
    });
  });

  describe("createCommission", () => {
    it("inserts and returns commission", async () => {
      const comm = { id: "c1", agentId: "a1", amount: "100000" };
      const chain = {
        values: jest.fn(() => ({
          returning: jest.fn(() => Promise.resolve([comm])),
        })),
      };
      (mockDb.insert as jest.Mock).mockReturnValue(chain);

      const result = await referralRepository.createCommission(comm as any);
      expect(result).toEqual(comm);
    });
  });

  describe("getCommissionsByAgent", () => {
    it("returns commissions for agent", async () => {
      const comms = [{ id: "c1" }];
      const chain = {
        from: jest.fn(() => ({
          where: jest.fn(() => Promise.resolve(comms)),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await referralRepository.getCommissionsByAgent("a1");
      expect(result).toEqual(comms);
    });
  });

  describe("findAllCommissions", () => {
    it("returns all commissions", async () => {
      const chain = {
        from: jest.fn(() => ({
          orderBy: jest.fn(() => Promise.resolve([])),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await referralRepository.findAllCommissions();
      expect(result).toEqual([]);
    });
  });

  describe("findCommissionById", () => {
    it("returns commission by id", async () => {
      const comm = { id: "c1" };
      const chain = {
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([comm])),
          })),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await referralRepository.findCommissionById("c1");
      expect(result).toEqual(comm);
    });
  });

  describe("updateCommission", () => {
    it("updates commission", async () => {
      const chain = {
        set: jest.fn(() => ({
          where: jest.fn(() => Promise.resolve()),
        })),
      };
      (mockDb.update as jest.Mock).mockReturnValue(chain);

      await referralRepository.updateCommission("c1", { status: "paid" });
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe("deleteCommission", () => {
    it("deletes commission", async () => {
      const chain = {
        where: jest.fn(() => Promise.resolve()),
      };
      (mockDb.delete as jest.Mock).mockReturnValue(chain);

      await referralRepository.deleteCommission("c1");
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });
});
