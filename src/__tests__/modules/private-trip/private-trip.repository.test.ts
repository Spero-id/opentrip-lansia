import { db } from "@/shared/db";
import { privateTripRepository } from "@/modules/private-trip/private-trip.repository";

describe("privateTripRepository", () => {
  const mockDb = jest.mocked(db);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("inserts and returns request", async () => {
      const req = { id: "1", title: "Custom Trip" };
      const chain = {
        values: jest.fn(() => ({
          returning: jest.fn(() => Promise.resolve([req])),
        })),
      };
      (mockDb.insert as jest.Mock).mockReturnValue(chain);

      const result = await privateTripRepository.create(req as any);
      expect(result).toEqual(req);
    });
  });

  describe("findByUserId", () => {
    it("returns requests for user", async () => {
      const requests = [{ id: "r1" }];
      const chain = {
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => Promise.resolve(requests)),
          })),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await privateTripRepository.findByUserId("user-1");
      expect(result).toEqual(requests);
    });
  });

  describe("findById", () => {
    it("returns request by id", async () => {
      const req = { id: "r1" };
      const chain = {
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([req])),
          })),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await privateTripRepository.findById("r1");
      expect(result).toEqual(req);
    });
  });
});
