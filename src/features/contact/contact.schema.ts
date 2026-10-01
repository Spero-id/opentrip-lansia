import { z } from "zod";

export { contactMessages, auditLogs } from "@/db/schema/utility";

export const contactMessageSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  email: z.string().email("Email tidak valid").max(255),
  phone: z.string().max(50).optional().nullable(),
  subject: z.string().max(255).optional().nullable(),
  message: z.string().min(1, "Pesan wajib diisi"),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
