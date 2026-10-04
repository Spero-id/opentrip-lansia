export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export interface MailTransport {
  send(message: MailMessage): Promise<void>;
}