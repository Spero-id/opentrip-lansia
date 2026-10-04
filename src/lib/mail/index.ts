import { ADMIN_EMAIL } from "@/lib/env/server";
import { getTransport } from "./nodemailer";
import {
  contactEmailTemplate,
  subscriptionEmailTemplate,
  type ContactEmailData,
} from "./templates";

export async function sendContactEmail(data: ContactEmailData): Promise<void> {
  await getTransport().send({
    to: ADMIN_EMAIL,
    subject: `Pesan Baru dari Contact Us - ${data.name}`,
    html: contactEmailTemplate(data),
  });
}

export async function sendSubscriptionConfirmationEmail(data: {
  email: string;
}): Promise<void> {
  await getTransport().send({
    to: data.email,
    subject: "Selamat Datang di Jelajah Memoria!",
    html: subscriptionEmailTemplate(),
  });
}