import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface ContactEmailData {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
}

export async function sendContactEmail(data: ContactEmailData) {
  const adminEmail = process.env.ADMIN_EMAIL;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #F49D1A;">Pesan Baru dari Contact Us</h2>
      <hr style="border: 1px solid #eee;" />
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 120px;">Nama</td>
          <td style="padding: 8px 0;">${data.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Email</td>
          <td style="padding: 8px 0;">${data.email}</td>
        </tr>
        ${data.phone ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Telepon</td>
          <td style="padding: 8px 0;">${data.phone}</td>
        </tr>` : ""}
        ${data.subject ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Subjek</td>
          <td style="padding: 8px 0;">${data.subject}</td>
        </tr>` : ""}
      </table>
      <hr style="border: 1px solid #eee;" />
      <h3 style="color: #333;">Pesan</h3>
      <p style="color: #555; line-height: 1.6;">${data.message}</p>
      <hr style="border: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px;">Email ini dikirim otomatis dari formulir Contact Us Jelajah Memoria.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Jelajah Memoria" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `Pesan Baru dari Contact Us - ${data.name}`,
    replyTo: data.email,
    html,
  });
}
