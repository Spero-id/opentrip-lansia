import { GET, POST } from "@/app/api/trips/route";
import { tripController } from "@/modules/trip/trip.controller";

jest.mock("@/modules/trip/trip.controller", () => ({
  tripController: {
    list: jest.fn(),
    create: jest.fn(),
  },
}));

describe("GET /api/trips", () => {
  it("delegates to tripController.list", async () => {
    const mockResponse = new Response(JSON.stringify([{ id: "1" }]));
    (tripController.list as jest.Mock).mockResolvedValue(mockResponse);

    const response = await GET();
    const data = await response.json();
    expect(data).toEqual([{ id: "1" }]);
  });
});

describe("POST /api/trips", () => {
  it("delegates to tripController.create", async () => {
    const mockResponse = new Response(JSON.stringify({ id: "1" }));
    (tripController.create as jest.Mock).mockResolvedValue(mockResponse);

    const req = new Request("http://localhost:3000/api/trips", {
      method: "POST",
      body: JSON.stringify({ title: "Trip" }),
    });
    const response = await POST(req as any);
    const data = await response.json();
    expect(data).toEqual({ id: "1" });
  });
});
