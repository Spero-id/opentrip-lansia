import { describe, expect, it } from "vitest";
import {
  contactEmailTemplate,
  subscriptionEmailTemplate,
  type ContactEmailData,
} from "@/lib/mail/templates";

const data: ContactEmailData = {
  name: "Budi",
  email: "budi@mail.com",
  phone: "62811",
  subject: " tanya paket ",
  message: "Halo, apakah ada trip ke Bromo?",
};

function oldContactHtml(d: ContactEmailData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FDC700;">Pesan Baru dari Contact Us</h2>
      <hr style="border: 1px solid #eee;" />
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 120px;">Nama</td>
          <td style="padding: 8px 0;">${d.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Email</td>
          <td style="padding: 8px 0;">${d.email}</td>
        </tr>
        ${d.phone ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Telepon</td>
          <td style="padding: 8px 0;">${d.phone}</td>
        </tr>` : ""}
        ${d.subject ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Subjek</td>
          <td style="padding: 8px 0;">${d.subject}</td>
        </tr>` : ""}
      </table>
      <hr style="border: 1px solid #eee;" />
      <h3 style="color: #333;">Pesan</h3>
      <p style="color: #555; line-height: 1.6;">${d.message}</p>
      <hr style="border: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px;">Email ini dikirim otomatis dari formulir Contact Us Jelajah Memoria.</p>
    </div>
  `;
}

function norm(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

describe("mail templates", () => {
  it("contact html equivalent to previous implementation", () => {
    expect(norm(contactEmailTemplate(data))).toBe(norm(oldContactHtml(data)));
  });

  it("contact html tanpa phone/subject", () => {
    const d = { ...data, phone: null, subject: null };
    expect(norm(contactEmailTemplate(d))).toBe(norm(oldContactHtml(d)));
  });

  it("subscription html memuat ajakan berlangganan", () => {
    const html = subscriptionEmailTemplate();
    expect(html).toContain("Selamat Datang di Jelajah Memoria!");
    expect(html).toContain("newsletter");
  });
});

function oldSubscriptionHtml(): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FDC700;">Selamat Datang di Jelajah Memoria!</h2>
      <hr style="border: 1px solid #eee;" />
      <p style="color: #555; line-height: 1.6;">Terima kasih sudah berlangganan newsletter kami. Kami akan mengirimkan info trip & promo terbaru langsung ke email Anda.</p>
      <hr style="border: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px;">Email ini dikirim otomatis dari sistem newsletter Jelajah Memoria.</p>
    </div>
  `;
}

describe("subscription template parity", () => {
  it("equivalent to previous implementation", () => {
    expect(norm(subscriptionEmailTemplate())).toBe(norm(oldSubscriptionHtml()));
  });
});
