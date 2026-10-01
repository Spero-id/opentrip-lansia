import { subscriberRepository } from "./newsletter.repository";
import { subscribeSchema, type SubscribeInput } from "./newsletter.schema";
import { sendSubscriptionConfirmationEmail } from "@/lib/mail";
import { ValidationError, ConflictError } from "@/shared/errors/app-error";

export const subscribeService = {
  async subscribe(data: SubscribeInput) {
    const parsed = subscribeSchema.safeParse(data);

    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join(", ");
      throw new ValidationError(message);
    }

    const existing = await subscriberRepository.findByEmail(parsed.data.email);
    if (existing) {
      throw new ConflictError("Email sudah terdaftar");
    }

    const subscriber = await subscriberRepository.create(parsed.data);

    try {
      await sendSubscriptionConfirmationEmail({ email: parsed.data.email });
    } catch (emailErr) {
      console.error("Gagal kirim email sambutan:", emailErr);
    }

    return subscriber;
  },
};