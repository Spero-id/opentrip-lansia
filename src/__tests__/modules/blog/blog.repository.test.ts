import { db } from "@/shared/db";
import { blogRepository } from "@/modules/blog/blog.repository";

describe("blogRepository", () => {
  const mockDb = jest.mocked(db);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAllPublished", () => {
    it("returns published blogs", async () => {
      const blogs = [{ id: "1", status: "published" }];
      const chain = {
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => Promise.resolve(blogs)),
          })),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await blogRepository.findAllPublished();
      expect(result).toEqual(blogs);
    });
  });

  describe("findAll", () => {
    it("returns all blogs", async () => {
      const blogs = [{ id: "1" }, { id: "2" }];
      const chain = {
        from: jest.fn(() => ({
          orderBy: jest.fn(() => Promise.resolve(blogs)),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await blogRepository.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe("findById", () => {
    it("returns blog by id", async () => {
      const blog = { id: "1", title: "Test" };
      const chain = {
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([blog])),
          })),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await blogRepository.findById("1");
      expect(result).toEqual(blog);
    });
  });

  describe("findBySlug", () => {
    it("returns blog by slug", async () => {
      const blog = { id: "1", slug: "test" };
      const chain = {
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([blog])),
          })),
        })),
      };
      (mockDb.select as jest.Mock).mockReturnValue(chain);

      const result = await blogRepository.findBySlug("test");
      expect(result).toEqual(blog);
    });
  });

  describe("create", () => {
    it("inserts and returns blog", async () => {
      const blog = { id: "1", title: "New" };
      const chain = {
        values: jest.fn(() => ({
          returning: jest.fn(() => Promise.resolve([blog])),
        })),
      };
      (mockDb.insert as jest.Mock).mockReturnValue(chain);

      const result = await blogRepository.create(blog as any);
      expect(result).toEqual(blog);
    });
  });

  describe("update", () => {
    it("updates blog", async () => {
      const chain = {
        set: jest.fn(() => ({
          where: jest.fn(() => Promise.resolve()),
        })),
      };
      (mockDb.update as jest.Mock).mockReturnValue(chain);

      await blogRepository.update("1", { title: "Updated" });
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("deletes blog", async () => {
      const chain = {
        where: jest.fn(() => Promise.resolve()),
      };
      (mockDb.delete as jest.Mock).mockReturnValue(chain);

      await blogRepository.delete("1");
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });
});
