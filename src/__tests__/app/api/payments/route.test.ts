import { POST } from "@/app/api/payments/route";
import { paymentController } from "@/modules/payment/payment.controller";

jest.mock("@/modules/payment/payment.controller", () => ({
  paymentController: {
    create: jest.fn(),
  },
}));

describe("POST /api/payments", () => {
  it("delegates to paymentController.create", async () => {
    const mockResponse = new Response(JSON.stringify({ id: "p1" }));
    (paymentController.create as jest.Mock).mockResolvedValue(mockResponse);

    const req = new Request("http://localhost:3000/api/payments", {
      method: "POST",
      body: JSON.stringify({ bookingId: "b1", method: "bank_transfer", amount: "100000" }),
    });
    const response = await POST(req as any);
    const data = await response.json();
    expect(data).toEqual({ id: "p1" });
  });
});
