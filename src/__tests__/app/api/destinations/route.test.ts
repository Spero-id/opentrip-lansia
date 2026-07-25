import { GET } from "@/app/api/destinations/route";
import { masterRepository } from "@/modules/master/master.repository";

jest.mock("@/modules/master/master.repository", () => ({
  masterRepository: {
    getDestinations: jest.fn(),
  },
}));

describe("GET /api/destinations", () => {
  it("returns all destinations", async () => {
    const destinations = [{ id: "d1", name: "Bali" }];
    (masterRepository.getDestinations as jest.Mock).mockResolvedValue(destinations);

    const response = await GET();
    const data = await response.json();
    expect(data).toEqual(destinations);
  });
});
