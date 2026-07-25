import { GET, PUT, DELETE } from "@/app/api/galleries/[id]/route";
import { db } from "@/db";

const mockDb = jest.mocked(db);

describe("GET /api/galleries/[id]", () => {
  it("returns gallery when found", async () => {
    const gallery = { id: "g1", title: "Gallery" };
    const chain = {
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve([gallery])),
        })),
      })),
    };
    (mockDb.select as jest.Mock).mockReturnValue(chain);

    const req = new Request("http://localhost:3000/api/galleries/g1");
    const response = await GET(req, { params: Promise.resolve({ id: "g1" }) });
    const data = await response.json();
    expect(data).toEqual(gallery);
  });

  it("returns 404 when not found", async () => {
    const chain = {
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve([])),
        })),
      })),
    };
    (mockDb.select as jest.Mock).mockReturnValue(chain);

    const req = new Request("http://localhost:3000/api/galleries/nonexistent");
    const response = await GET(req, { params: Promise.resolve({ id: "nonexistent" }) });
    expect(response.status).toBe(404);
  });
});

describe("PUT /api/galleries/[id]", () => {
  it("updates gallery", async () => {
    const gallery = { id: "g1", title: "Updated" };
    const chain = {
      set: jest.fn(() => ({
        where: jest.fn(() => ({
          returning: jest.fn(() => Promise.resolve([gallery])),
        })),
      })),
    };
    (mockDb.update as jest.Mock).mockReturnValue(chain);

    const req = new Request("http://localhost:3000/api/galleries/g1", {
      method: "PUT",
      body: JSON.stringify({ title: "Updated" }),
    });
    const response = await PUT(req, { params: Promise.resolve({ id: "g1" }) });
    const data = await response.json();
    expect(data).toEqual(gallery);
  });
});

describe("DELETE /api/galleries/[id]", () => {
  it("deletes gallery", async () => {
    const chain = { where: jest.fn(() => Promise.resolve()) };
    (mockDb.delete as jest.Mock).mockReturnValue(chain);

    const req = new Request("http://localhost:3000/api/galleries/g1", { method: "DELETE" });
    const response = await DELETE(req, { params: Promise.resolve({ id: "g1" }) });
    const data = await response.json();
    expect(data).toEqual({ message: "deleted" });
  });
});
