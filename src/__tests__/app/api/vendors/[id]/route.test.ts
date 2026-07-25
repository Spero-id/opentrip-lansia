import { GET, PUT, DELETE } from "@/app/api/vendors/[id]/route";
import { masterRepository } from "@/modules/master/master.repository";

jest.mock("@/modules/master/master.repository", () => ({
  masterRepository: {
    getVendorById: jest.fn(),
    updateVendor: jest.fn(),
    deleteVendor: jest.fn(),
  },
}));

describe("GET /api/vendors/[id]", () => {
  it("returns vendor when found", async () => {
    const vendor = { id: "v1", name: "Vendor A" };
    (masterRepository.getVendorById as jest.Mock).mockResolvedValue(vendor);

    const req = new Request("http://localhost:3000/api/vendors/v1");
    const response = await GET(req, { params: Promise.resolve({ id: "v1" }) });
    const data = await response.json();
    expect(data).toEqual(vendor);
  });
});

describe("PUT /api/vendors/[id]", () => {
  it("updates vendor", async () => {
    const vendor = { id: "v1", name: "Updated" };
    (masterRepository.updateVendor as jest.Mock).mockResolvedValue(vendor);

    const req = new Request("http://localhost:3000/api/vendors/v1", {
      method: "PUT",
      body: JSON.stringify({ name: "Updated" }),
    });
    const response = await PUT(req, { params: Promise.resolve({ id: "v1" }) });
    const data = await response.json();
    expect(data).toEqual(vendor);
  });
});

describe("DELETE /api/vendors/[id]", () => {
  it("deletes vendor", async () => {
    const req = new Request("http://localhost:3000/api/vendors/v1", { method: "DELETE" });
    const response = await DELETE(req, { params: Promise.resolve({ id: "v1" }) });
    const data = await response.json();
    expect(data).toEqual({ message: "deleted" });
  });
});
