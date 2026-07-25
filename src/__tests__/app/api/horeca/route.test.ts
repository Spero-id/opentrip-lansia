import { GET, POST } from "@/app/api/horeca/route";
import { masterRepository } from "@/modules/master/master.repository";

jest.mock("@/modules/master/master.repository", () => ({
  masterRepository: {
    getHorecaList: jest.fn(),
    createHoreca: jest.fn(),
  },
}));

describe("GET /api/horeca", () => {
  it("returns horeca list", async () => {
    const list = [{ id: "h1", name: "Hotel A" }];
    (masterRepository.getHorecaList as jest.Mock).mockResolvedValue(list);

    const response = await GET();
    const data = await response.json();
    expect(data).toEqual(list);
  });
});

describe("POST /api/horeca", () => {
  it("creates horeca entry", async () => {
    const item = { id: "h1", name: "New Hotel" };
    (masterRepository.createHoreca as jest.Mock).mockResolvedValue(item);

    const req = new Request("http://localhost:3000/api/horeca", {
      method: "POST",
      body: JSON.stringify({ name: "New Hotel", typeId: "t1" }),
    });
    const response = await POST(req as any);
    const data = await response.json();
    expect(data).toEqual(item);
  });
});
