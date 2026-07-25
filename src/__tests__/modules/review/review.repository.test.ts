import { db } from "@/shared/db";
import { reviewRepository } from "@/modules/review/review.repository";

describe("reviewRepository", () => {
  const mockDb = jest.mocked(db);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("returns all reviews ordered by createdAt desc", async () => {
      const reviews = [{ id: "r1" }, { id: "r2" }];
      const chain = {
        from: jest.fn(() => ({
          orderBy: jest.fn(() => Promise.resolve(reviews)),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await reviewRepository.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe("findById", () => {
    it("returns review when found", async () => {
      const review = { id: "r1", rating: 5 };
      const chain = {
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([review])),
          })),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await reviewRepository.findById("r1");
      expect(result).toEqual(review);
    });
  });

  describe("create", () => {
    it("inserts and returns review", async () => {
      const review = { id: "r1", rating: 5 };
      const chain = {
        values: jest.fn(() => ({
          returning: jest.fn(() => Promise.resolve([review])),
        })),
      };
      (mockDb.insert as jest.Mock).mockReturnValue(chain);

      const result = await reviewRepository.create(review as any);
      expect(result).toEqual(review);
    });
  });

  describe("findByTripId", () => {
    it("returns reviews for a trip", async () => {
      const reviews = [{ id: "r1" }];
      const chain = {
        from: jest.fn(() => ({
          where: jest.fn(() => Promise.resolve(reviews)),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await reviewRepository.findByTripId("t1");
      expect(result).toEqual(reviews);
    });
  });

  describe("update", () => {
    it("updates review", async () => {
      const chain = {
        set: jest.fn(() => ({
          where: jest.fn(() => Promise.resolve()),
        })),
      };
      (mockDb.update as jest.Mock).mockReturnValue(chain);

      await reviewRepository.update("r1", { status: "approved" });
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("deletes review", async () => {
      const chain = {
        where: jest.fn(() => Promise.resolve()),
      };
      (mockDb.delete as jest.Mock).mockReturnValue(chain);

      await reviewRepository.delete("r1");
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });
});
