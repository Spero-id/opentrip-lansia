import { GET } from "@/app/api/destinations/categories/route";
import { masterRepository } from "@/modules/master/master.repository";

jest.mock("@/modules/master/master.repository", () => ({
  masterRepository: {
    getDestinationCategories: jest.fn(),
  },
}));

describe("GET /api/destinations/categories", () => {
  it("returns destination categories", async () => {
    const categories = [{ id: "c1", name: "Beach" }];
    (masterRepository.getDestinationCategories as jest.Mock).mockResolvedValue(categories);

    const response = await GET();
    const data = await response.json();
    expect(data).toEqual(categories);
  });
});
