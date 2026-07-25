import { NextRequest } from "next/server";
import { paymentController } from "@/modules/payment/payment.controller";
import { paymentService } from "@/modules/payment/payment.service";

jest.mock("@/modules/payment/payment.service", () => ({
  paymentService: {
    createPayment: jest.fn(),
  },
}));

describe("paymentController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("creates payment from request", async () => {
      const payment = { id: "payment-1", status: "pending" };
      (paymentService.createPayment as jest.Mock).mockResolvedValue(payment);

      const req = new NextRequest("http://localhost:3000/api/payments", {
        method: "POST",
        body: JSON.stringify({
          bookingId: "booking-1",
          method: "bank_transfer",
          amount: "3000000",
        }),
      });

      const response = await paymentController.create(req);
      const data = await response.json();

      expect(data).toEqual(payment);
      expect(response.status).toBe(200);
    });

    it("returns error on failure", async () => {
      (paymentService.createPayment as jest.Mock).mockRejectedValue(new Error("Failed"));

      const req = new NextRequest("http://localhost:3000/api/payments", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await paymentController.create(req);
      const data = await response.json();

      expect(data).toEqual({ error: "Failed" });
      expect(response.status).toBe(400);
    });
  });
});
