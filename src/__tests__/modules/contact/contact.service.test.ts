import { contactService } from "@/modules/contact/contact.service";
import { contactRepository } from "@/modules/contact/contact.repository";

jest.mock("@/modules/contact/contact.repository", () => ({
  contactRepository: {
    create: jest.fn(),
  },
}));

describe("contactService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("submitMessage", () => {
    it("creates contact message", async () => {
      const data = { name: "Test", email: "test@test.com", message: "Hello" };
      const created = { id: "msg-1", ...data };
      (contactRepository.create as jest.Mock).mockResolvedValue(created);

      const result = await contactService.submitMessage(data);
      expect(result).toEqual(created);
      expect(contactRepository.create).toHaveBeenCalledWith(data);
    });
  });
});
