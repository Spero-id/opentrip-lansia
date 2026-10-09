import { ADMIN_EMAIL, RESEND_API_KEY, RESEND_EMAIL_FROM } from "@/lib/env/server";
import { Resend } from "resend";
import {
  contactEmailTemplate,
  subscriptionEmailTemplate,
  type ContactEmailData,
} from "./templates";

const SENDER_NAME = "Jelajah Memoria";
const FROM = `${SENDER_NAME} <${RESEND_EMAIL_FROM}>`;

const resend = new Resend(RESEND_API_KEY);

export async function sendContactEmail(
  userData: ContactEmailData,
): Promise<void> {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    replyTo: userData.email,
    subject: `Pesan Baru dari Contact Us - ${userData.name}`,
    html: contactEmailTemplate(userData),
  });

  if (error) {
    console.error("Gagal mengirim email contact us:", error);
    throw new Error(error.message);
  }

  console.log("Email contact us terkirim:", data?.id);
}

export async function sendSubscriptionConfirmationEmail(userData: {
  email: string;
}): Promise<void> {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: userData.email,
    subject: "Selamat Datang di Jelajah Memoria",
    html: subscriptionEmailTemplate(),
  });

  if (error) {
    console.error("Gagal mengirim email sambutan:", error);
    throw new Error(error.message);
  }

  console.log("Email sambutan terkirim:", data?.id);
}
