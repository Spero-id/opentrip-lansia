import { GET, PUT, DELETE } from "@/app/api/blogs/[id]/route";
import { blogRepository } from "@/modules/blog/blog.repository";

jest.mock("@/modules/blog/blog.repository", () => ({
  blogRepository: {
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("GET /api/blogs/[id]", () => {
  it("returns blog when found", async () => {
    const blog = { id: "b1", title: "Blog" };
    (blogRepository.findById as jest.Mock).mockResolvedValue(blog);

    const req = new Request("http://localhost:3000/api/blogs/b1");
    const response = await GET(req, { params: Promise.resolve({ id: "b1" }) });
    const data = await response.json();
    expect(data).toEqual(blog);
  });

  it("returns 404 when not found", async () => {
    (blogRepository.findById as jest.Mock).mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/blogs/nonexistent");
    const response = await GET(req, { params: Promise.resolve({ id: "nonexistent" }) });
    expect(response.status).toBe(404);
  });
});

describe("PUT /api/blogs/[id]", () => {
  it("updates blog", async () => {
    const req = new Request("http://localhost:3000/api/blogs/b1", {
      method: "PUT",
      body: JSON.stringify({ title: "Updated" }),
    });
    const response = await PUT(req, { params: Promise.resolve({ id: "b1" }) });
    const data = await response.json();
    expect(data).toEqual({ message: "updated" });
  });
});

describe("DELETE /api/blogs/[id]", () => {
  it("deletes blog", async () => {
    const req = new Request("http://localhost:3000/api/blogs/b1", { method: "DELETE" });
    const response = await DELETE(req, { params: Promise.resolve({ id: "b1" }) });
    const data = await response.json();
    expect(data).toEqual({ message: "deleted" });
  });
});
