import { GET, POST } from "@/app/api/vendors/route";
import { masterRepository } from "@/modules/master/master.repository";

jest.mock("@/modules/master/master.repository", () => ({
  masterRepository: {
    getVendors: jest.fn(),
    createVendor: jest.fn(),
  },
}));

describe("GET /api/vendors", () => {
  it("returns all vendors", async () => {
    const vendors = [{ id: "v1", name: "Vendor A" }];
    (masterRepository.getVendors as jest.Mock).mockResolvedValue(vendors);

    const response = await GET();
    const data = await response.json();
    expect(data).toEqual(vendors);
  });
});

describe("POST /api/vendors", () => {
  it("creates a vendor", async () => {
    const vendor = { id: "v1", name: "New Vendor" };
    (masterRepository.createVendor as jest.Mock).mockResolvedValue(vendor);

    const req = new Request("http://localhost:3000/api/vendors", {
      method: "POST",
      body: JSON.stringify({ name: "New Vendor", typeId: "t1" }),
    });
    const response = await POST(req as any);
    const data = await response.json();
    expect(data).toEqual(vendor);
  });
});
