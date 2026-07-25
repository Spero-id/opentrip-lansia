import { GET, PUT, DELETE } from "@/app/api/horeca/[id]/route";
import { masterRepository } from "@/modules/master/master.repository";

jest.mock("@/modules/master/master.repository", () => ({
  masterRepository: {
    getHorecaById: jest.fn(),
    updateHoreca: jest.fn(),
    deleteHoreca: jest.fn(),
  },
}));

describe("GET /api/horeca/[id]", () => {
  it("returns horeca when found", async () => {
    const item = { id: "h1", name: "Hotel A" };
    (masterRepository.getHorecaById as jest.Mock).mockResolvedValue(item);

    const req = new Request("http://localhost:3000/api/horeca/h1");
    const response = await GET(req, { params: Promise.resolve({ id: "h1" }) });
    const data = await response.json();
    expect(data).toEqual(item);
  });
});

describe("PUT /api/horeca/[id]", () => {
  it("updates horeca", async () => {
    const item = { id: "h1", name: "Updated" };
    (masterRepository.updateHoreca as jest.Mock).mockResolvedValue(item);

    const req = new Request("http://localhost:3000/api/horeca/h1", {
      method: "PUT",
      body: JSON.stringify({ name: "Updated" }),
    });
    const response = await PUT(req, { params: Promise.resolve({ id: "h1" }) });
    const data = await response.json();
    expect(data).toEqual(item);
  });
});

describe("DELETE /api/horeca/[id]", () => {
  it("deletes horeca", async () => {
    const req = new Request("http://localhost:3000/api/horeca/h1", { method: "DELETE" });
    const response = await DELETE(req, { params: Promise.resolve({ id: "h1" }) });
    const data = await response.json();
    expect(data).toEqual({ message: "deleted" });
  });
});
