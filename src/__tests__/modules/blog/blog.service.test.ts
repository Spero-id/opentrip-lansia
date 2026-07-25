import { blogService } from "@/modules/blog/blog.service";
import { blogRepository } from "@/modules/blog/blog.repository";

jest.mock("@/modules/blog/blog.repository", () => ({
  blogRepository: {
    findAllPublished: jest.fn(),
    findBySlug: jest.fn(),
  },
}));

describe("blogService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPublishedBlogs", () => {
    it("returns published blogs", async () => {
      const blogs = [{ id: "1", title: "Blog A" }];
      (blogRepository.findAllPublished as jest.Mock).mockResolvedValue(blogs);
      const result = await blogService.getPublishedBlogs();
      expect(result).toEqual(blogs);
    });
  });

  describe("getBlogBySlug", () => {
    it("returns blog by slug", async () => {
      const blog = { id: "1", slug: "test-blog" };
      (blogRepository.findBySlug as jest.Mock).mockResolvedValue(blog);
      const result = await blogService.getBlogBySlug("test-blog");
      expect(result).toEqual(blog);
    });
  });
});
