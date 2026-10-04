import nodemailer from "nodemailer";
import {
  SMTP_FROM,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
} from "@/lib/env/server";
import type { MailMessage, MailTransport } from "./transport";

const SENDER_NAME = "Jelajah Memoria";
const REPLY_TO = "no-reply@jelajahmemoria.com";

let instance: MailTransport | null = null;

function createNodemailerTransport(): MailTransport {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return {
    async send(message: MailMessage) {
      await transporter.sendMail({
        from: `"${SENDER_NAME}" <${SMTP_FROM || SMTP_USER}>`,
        to: message.to,
        subject: message.subject,
        replyTo: message.replyTo ?? REPLY_TO,
        html: message.html,
      });
    },
  };
}

export function getTransport(): MailTransport {
  instance ??= createNodemailerTransport();
  return instance;
}