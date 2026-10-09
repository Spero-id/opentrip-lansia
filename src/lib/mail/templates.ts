const BRAND_COLOR = "#FDC700"; // ≈ --primary light oklch(0.852 0.199 91.936); email perlu hex literal
const BODY_COLOR = "#555";

export interface ContactEmailData {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
}

interface Row {
  label: string;
  value: string;
}

function row({ label, value }: Row, first: boolean): string {
  const width = first ? " width: 120px;" : "";
  return `<tr>
          <td style="padding: 8px 0; font-weight: bold;${width}">${label}</td>
          <td style="padding: 8px 0;">${value}</td>
        </tr>`;
}

function layout(body: string, footer: string): string {
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    ${body}
    <hr style="border: 1px solid #eee;" />
    <p style="color: #999; font-size: 12px;">${footer}</p>
  </div>`;
}

export function contactEmailTemplate(data: ContactEmailData): string {
  const rows: Row[] = [
    { label: "Nama", value: data.name },
    { label: "Email", value: data.email },
  ];
  if (data.phone) rows.push({ label: "Telepon", value: data.phone });
  if (data.subject) rows.push({ label: "Subjek", value: data.subject });

  return layout(
    `
    <h2 style="color: ${BRAND_COLOR};">Pesan Baru dari Contact Us</h2>
    <hr style="border: 1px solid #eee;" />
    <table style="width: 100%; border-collapse: collapse;">
      ${rows.map((r, i) => row(r, i === 0)).join("\n      ")}
    </table>
    <hr style="border: 1px solid #eee;" />
    <h3 style="color: #333;">Pesan</h3>
    <p style="color: ${BODY_COLOR}; line-height: 1.6;">${data.message}</p>`,
    "Email ini dikirim otomatis dari formulir Contact Us Jelajah Memoria.",
  );
}

export function subscriptionEmailTemplate(): string {
  return layout(
    `
    <h2 style="color: ${BRAND_COLOR};">Selamat Datang di Jelajah Memoria!</h2>
    <hr style="border: 1px solid #eee;" />
    <p style="color: ${BODY_COLOR}; line-height: 1.6;">Terima kasih sudah berlangganan newsletter kami. Kami akan mengirimkan info trip & promo terbaru langsung ke email Anda.</p>`,
    "Email ini dikirim otomatis dari sistem newsletter Jelajah Memoria.",
  );
}