import { contactRepository } from "./contact.repository";

export const contactService = {
  async submitMessage(data: Parameters<typeof contactRepository.create>[0]) {
    return contactRepository.create(data);
  },
};
