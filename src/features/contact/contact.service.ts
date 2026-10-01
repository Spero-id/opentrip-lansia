import { contactRepository } from "./contact.repository";
import { contactMessageSchema, type ContactMessageInput } from "./contact.schema";
import { sendContactEmail } from "@/lib/mail";
import { ValidationError } from "@/shared/errors/app-error";

export const contactService = {
  async submitMessage(data: ContactMessageInput) {
    const parsed = contactMessageSchema.safeParse(data);

    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join(", ");
      throw new ValidationError(message);
    }

    const msg = await contactRepository.create(parsed.data);

    try {
      await sendContactEmail(parsed.data);
    } catch (emailErr) {
      console.error("Gagal kirim email contact us:", emailErr);
    }

    return msg;
  },
};
