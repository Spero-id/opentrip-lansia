import { POST } from "@/app/api/bookings/route";
import { bookingController } from "@/modules/booking/booking.controller";

jest.mock("@/modules/booking/booking.controller", () => ({
  bookingController: {
    create: jest.fn(),
  },
}));

describe("POST /api/bookings", () => {
  it("delegates to bookingController.create", async () => {
    const mockResponse = new Response(JSON.stringify({ id: "b1" }));
    (bookingController.create as jest.Mock).mockResolvedValue(mockResponse);

    const req = new Request("http://localhost:3000/api/bookings", {
      method: "POST",
      body: JSON.stringify({ departureId: "d1", items: [] }),
    });
    const response = await POST(req as any);
    const data = await response.json();
    expect(data).toEqual({ id: "b1" });
  });
});
