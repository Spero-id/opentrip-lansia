import { db } from "@/shared/db";
import { contactRepository } from "@/modules/contact/contact.repository";

describe("contactRepository", () => {
  const mockDb = jest.mocked(db);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("inserts and returns message", async () => {
      const msg = { id: "1", name: "Test", email: "test@test.com", message: "Hello" };
      const chain = {
        values: jest.fn(() => ({
          returning: jest.fn(() => Promise.resolve([msg])),
        })),
      };
      (mockDb.insert as jest.Mock).mockReturnValue(chain);

      const result = await contactRepository.create(msg as any);
      expect(result).toEqual(msg);
    });
  });
});
