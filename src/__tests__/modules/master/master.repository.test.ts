import { db } from "@/shared/db";
import { masterRepository } from "@/modules/master/master.repository";

describe("masterRepository", () => {
  const mockDb = jest.mocked(db);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getDestinations", () => {
    it("returns all destinations", async () => {
      const chain = {
        from: jest.fn(() => Promise.resolve([])),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await masterRepository.getDestinations();
      expect(result).toEqual([]);
    });
  });

  describe("getDestinationById", () => {
    it("returns destination when found", async () => {
      const dest = { id: "d1", name: "Bali" };
      const chain = {
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([dest])),
          })),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await masterRepository.getDestinationById("d1");
      expect(result).toEqual(dest);
    });
  });

  describe("createDestination", () => {
    it("inserts and returns destination", async () => {
      const dest = { id: "d1", name: "New Dest" };
      const chain = {
        values: jest.fn(() => ({
          returning: jest.fn(() => Promise.resolve([dest])),
        })),
      };
      (mockDb.insert as jest.Mock).mockReturnValue(chain);

      const result = await masterRepository.createDestination(dest as any);
      expect(result).toEqual(dest);
    });
  });

  describe("updateDestination", () => {
    it("updates and returns destination", async () => {
      const dest = { id: "d1", name: "Updated" };
      const chain = {
        set: jest.fn(() => ({
          where: jest.fn(() => ({
            returning: jest.fn(() => Promise.resolve([dest])),
          })),
        })),
      };
      (mockDb.update as jest.Mock).mockReturnValue(chain);

      const result = await masterRepository.updateDestination("d1", { name: "Updated" });
      expect(result).toEqual(dest);
    });
  });

  describe("deleteDestination", () => {
    it("deletes destination", async () => {
      const chain = {
        where: jest.fn(() => Promise.resolve()),
      };
      (mockDb.delete as jest.Mock).mockReturnValue(chain);

      await masterRepository.deleteDestination("d1");
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });

  describe("getDestinationCategories", () => {
    it("returns categories", async () => {
      const chain = {
        from: jest.fn(() => Promise.resolve([])),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await masterRepository.getDestinationCategories();
      expect(result).toEqual([]);
    });
  });

  describe("getHorecaList / getHorecaById", () => {
    it("returns horeca list", async () => {
      const chain = { from: jest.fn(() => Promise.resolve([])) };
      (mockDb.select as jest.Mock).mockReturnValue(chain);
      const result = await masterRepository.getHorecaList();
      expect(result).toEqual([]);
    });

    it("returns horeca by id", async () => {
      const item = { id: "h1", name: "Hotel A" };
      const chain = {
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([item])),
          })),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);
      const result = await masterRepository.getHorecaById("h1");
      expect(result).toEqual(item);
    });
  });

  describe("getVendors / getVendorById", () => {
    it("returns vendor list", async () => {
      const chain = { from: jest.fn(() => Promise.resolve([])) };
      (mockDb.select as jest.Mock).mockReturnValue(chain);
      const result = await masterRepository.getVendors();
      expect(result).toEqual([]);
    });

    it("returns vendor by id", async () => {
      const item = { id: "v1", name: "Vendor A" };
      const chain = {
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([item])),
          })),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);
      const result = await masterRepository.getVendorById("v1");
      expect(result).toEqual(item);
    });
  });
});
