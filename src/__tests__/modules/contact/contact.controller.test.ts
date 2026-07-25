import { NextRequest } from "next/server";
import { contactController } from "@/modules/contact/contact.controller";
import { contactService } from "@/modules/contact/contact.service";

jest.mock("@/modules/contact/contact.service", () => ({
  contactService: {
    submitMessage: jest.fn(),
  },
}));

describe("contactController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("submits contact message", async () => {
      const msg = { id: "msg-1", name: "Test" };
      (contactService.submitMessage as jest.Mock).mockResolvedValue(msg);

      const req = new NextRequest("http://localhost:3000/api/contact", {
        method: "POST",
        body: JSON.stringify({ name: "Test", email: "test@test.com", message: "Hello" }),
      });

      const response = await contactController.create(req);
      const data = await response.json();

      expect(data).toEqual(msg);
    });
  });
});
