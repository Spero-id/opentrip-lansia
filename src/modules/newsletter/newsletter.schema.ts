import { z } from "zod";

export { subscribers } from "@/db/schema/utility";
export type { Subscriber } from "@/db/schema/utility";

export const subscribeSchema = z.object({
  email: z.string().email("Email tidak valid").max(255),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;
