import { db } from "@/shared/db";
import { tripRepository } from "@/modules/trip/trip.repository";

describe("tripRepository", () => {
  const mockDb = jest.mocked(db);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAllPublished", () => {
    it("returns published trips with deduplication", async () => {
      const rows = [
        { id: "1", title: "Trip A", slug: "trip-a", startDate: "2025-06-01", price: "100000", departureId: "d1" },
        { id: "1", title: "Trip A", slug: "trip-a", startDate: "2025-07-01", price: "120000", departureId: "d2" },
      ];
      const selectChain = {
        from: jest.fn(() => ({
          leftJoin: jest.fn(() => ({
            leftJoin: jest.fn(() => ({
              where: jest.fn(() => ({
                orderBy: jest.fn(() => Promise.resolve(rows)),
              })),
            })),
          })),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(selectChain);

      const result = await tripRepository.findAllPublished();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Trip A");
    });
  });

  describe("findBySlug", () => {
    it("returns trip by slug", async () => {
      const trip = { id: "1", slug: "test-trip", title: "Test" };
      const selectChain = {
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([trip])),
          })),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(selectChain);

      const result = await tripRepository.findBySlug("test-trip");
      expect(result).toEqual(trip);
    });
  });

  describe("findById", () => {
    it("returns trip by id", async () => {
      const trip = { id: "1", title: "Test" };
      const selectChain = {
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([trip])),
          })),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(selectChain);

      const result = await tripRepository.findById("1");
      expect(result).toEqual(trip);
    });
  });

  describe("create", () => {
    it("inserts and returns trip", async () => {
      const trip = { id: "1", title: "New Trip" };
      const insertChain = {
        values: jest.fn(() => ({
          returning: jest.fn(() => Promise.resolve([trip])),
        })),
      };
      (mockDb.insert as jest.Mock).mockReturnValue(insertChain);

      const result = await tripRepository.create(trip as any);
      expect(result).toEqual(trip);
    });
  });

  describe("update", () => {
    it("updates and returns trip", async () => {
      const trip = { id: "1", title: "Updated" };
      const updateChain = {
        set: jest.fn(() => ({
          where: jest.fn(() => ({
            returning: jest.fn(() => Promise.resolve([trip])),
          })),
        })),
      };
      (mockDb.update as jest.Mock).mockReturnValue(updateChain);

      const result = await tripRepository.update("1", { title: "Updated" });
      expect(result).toEqual(trip);
    });

    it("returns null when not found", async () => {
      const updateChain = {
        set: jest.fn(() => ({
          where: jest.fn(() => ({
            returning: jest.fn(() => Promise.resolve([])),
          })),
        })),
      };
      (mockDb.update as jest.Mock).mockReturnValue(updateChain);

      const result = await tripRepository.update("nonexistent", { title: "Updated" });
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("deletes trip by id", async () => {
      const deleteChain = {
        where: jest.fn(() => Promise.resolve()),
      };
      (mockDb.delete as jest.Mock).mockReturnValue(deleteChain);

      await tripRepository.delete("1");
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });

  describe("updateQuota", () => {
    it("returns true when quota updated", async () => {
      const updateChain = {
        set: jest.fn(() => ({
          where: jest.fn(() => Promise.resolve({ rowCount: 1 })),
        })),
      };
      (mockDb.update as jest.Mock).mockReturnValue(updateChain);

      const result = await tripRepository.updateQuota("price-1", 2);
      expect(result).toBe(true);
    });

    it("returns false when no rows affected", async () => {
      const updateChain = {
        set: jest.fn(() => ({
          where: jest.fn(() => Promise.resolve({ rowCount: 0 })),
        })),
      };
      (mockDb.update as jest.Mock).mockReturnValue(updateChain);

      const result = await tripRepository.updateQuota("price-1", 2);
      expect(result).toBe(false);
    });
  });
});
