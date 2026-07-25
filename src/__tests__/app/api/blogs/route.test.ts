import { GET, POST } from "@/app/api/blogs/route";
import { blogRepository } from "@/modules/blog/blog.repository";

jest.mock("@/modules/blog/blog.repository", () => ({
  blogRepository: {
    findAll: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("@/shared/utils/helpers", () => ({
  slugify: jest.fn((s: string) => s.toLowerCase().replace(/\s+/g, "-")),
}));

describe("GET /api/blogs", () => {
  it("returns all blogs", async () => {
    const blogs = [{ id: "1", title: "Blog A" }];
    (blogRepository.findAll as jest.Mock).mockResolvedValue(blogs);

    const response = await GET();
    const data = await response.json();
    expect(data).toEqual(blogs);
  });
});

describe("POST /api/blogs", () => {
  it("creates a blog with slug", async () => {
    const blog = { id: "1", title: "New Blog" };
    (blogRepository.create as jest.Mock).mockResolvedValue(blog);

    const req = new Request("http://localhost:3000/api/blogs", {
      method: "POST",
      body: JSON.stringify({ title: "New Blog", content: "Content" }),
    });
    const response = await POST(req as any);
    const data = await response.json();
    expect(data).toEqual(blog);
  });
});
