import { GET, PUT, DELETE } from "@/app/api/destinations/[id]/route";
import { masterRepository } from "@/modules/master/master.repository";

jest.mock("@/modules/master/master.repository", () => ({
  masterRepository: {
    getDestinationById: jest.fn(),
    updateDestination: jest.fn(),
    deleteDestination: jest.fn(),
  },
}));

describe("GET /api/destinations/[id]", () => {
  it("returns destination when found", async () => {
    const dest = { id: "d1", name: "Bali" };
    (masterRepository.getDestinationById as jest.Mock).mockResolvedValue(dest);

    const req = new Request("http://localhost:3000/api/destinations/d1");
    const response = await GET(req, { params: Promise.resolve({ id: "d1" }) });
    const data = await response.json();
    expect(data).toEqual(dest);
  });

  it("returns 404 when not found", async () => {
    (masterRepository.getDestinationById as jest.Mock).mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/destinations/nonexistent");
    const response = await GET(req, { params: Promise.resolve({ id: "nonexistent" }) });
    expect(response.status).toBe(404);
  });
});

describe("PUT /api/destinations/[id]", () => {
  it("updates destination", async () => {
    const dest = { id: "d1", name: "Updated" };
    (masterRepository.updateDestination as jest.Mock).mockResolvedValue(dest);

    const req = new Request("http://localhost:3000/api/destinations/d1", {
      method: "PUT",
      body: JSON.stringify({ name: "Updated" }),
    });
    const response = await PUT(req, { params: Promise.resolve({ id: "d1" }) });
    const data = await response.json();
    expect(data).toEqual(dest);
  });
});

describe("DELETE /api/destinations/[id]", () => {
  it("deletes destination", async () => {
    const req = new Request("http://localhost:3000/api/destinations/d1", { method: "DELETE" });
    const response = await DELETE(req, { params: Promise.resolve({ id: "d1" }) });
    const data = await response.json();
    expect(data).toEqual({ message: "deleted" });
  });
});
