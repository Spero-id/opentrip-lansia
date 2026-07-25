import { POST } from "@/app/api/contact/route";
import { contactController } from "@/modules/contact/contact.controller";

jest.mock("@/modules/contact/contact.controller", () => ({
  contactController: {
    create: jest.fn(),
  },
}));

describe("POST /api/contact", () => {
  it("delegates to contactController.create", async () => {
    const mockResponse = new Response(JSON.stringify({ id: "msg-1" }));
    (contactController.create as jest.Mock).mockResolvedValue(mockResponse);

    const req = new Request("http://localhost:3000/api/contact", {
      method: "POST",
      body: JSON.stringify({ name: "Test", email: "test@test.com", message: "Hello" }),
    });
    const response = await POST(req as any);
    const data = await response.json();
    expect(data).toEqual({ id: "msg-1" });
  });
});
