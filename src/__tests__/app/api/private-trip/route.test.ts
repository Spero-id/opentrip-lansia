import { GET, POST } from "@/app/api/private-trip/route";
import { privateTripController } from "@/modules/private-trip/private-trip.controller";

jest.mock("@/modules/private-trip/private-trip.controller", () => ({
  privateTripController: {
    create: jest.fn(),
    listByUser: jest.fn(),
  },
}));

describe("POST /api/private-trip", () => {
  it("delegates to privateTripController.create", async () => {
    const mockResponse = new Response(JSON.stringify({ id: "req-1" }));
    (privateTripController.create as jest.Mock).mockResolvedValue(mockResponse);

    const req = new Request("http://localhost:3000/api/private-trip", {
      method: "POST",
      body: JSON.stringify({ title: "Custom Trip", durationDays: 5 }),
    });
    const response = await POST(req as any);
    const data = await response.json();
    expect(data).toEqual({ id: "req-1" });
  });
});

describe("GET /api/private-trip", () => {
  it("delegates to privateTripController.listByUser", async () => {
    const mockResponse = new Response(JSON.stringify([]));
    (privateTripController.listByUser as jest.Mock).mockResolvedValue(mockResponse);

    const req = new Request("http://localhost:3000/api/private-trip");
    const response = await GET(req as any);
    const data = await response.json();
    expect(data).toEqual([]);
  });
});
