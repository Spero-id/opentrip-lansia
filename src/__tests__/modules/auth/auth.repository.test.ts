import { db } from "@/shared/db";
import { authRepository } from "@/modules/auth/auth.repository";

describe("authRepository", () => {
  const mockDb = jest.mocked(db);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findById", () => {
    it("returns user when found", async () => {
      const user = { id: "1", email: "test@test.com", name: "Test" };
      const selectChain = {
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([user])),
          })),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(selectChain);

      const result = await authRepository.findById("1");
      expect(result).toEqual(user);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it("returns null when not found", async () => {
      const selectChain = {
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([])),
          })),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(selectChain);

      const result = await authRepository.findById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("findByEmail", () => {
    it("returns user by email", async () => {
      const user = { id: "1", email: "test@test.com", name: "Test" };
      const selectChain = {
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([user])),
          })),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(selectChain);

      const result = await authRepository.findByEmail("test@test.com");
      expect(result).toEqual(user);
    });
  });

  describe("update", () => {
    it("updates user data", async () => {
      const updateChain = {
        set: jest.fn(() => ({
          where: jest.fn(() => Promise.resolve()),
        })),
      };
      (mockDb.update as jest.Mock).mockReturnValue(updateChain);

      await authRepository.update("1", { name: "Updated" });
      expect(mockDb.update).toHaveBeenCalled();
    });
  });
});
