// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const createTransport = vi.fn(() => ({ sendMail: vi.fn() }));

vi.mock("nodemailer", () => ({
  default: { createTransport },
}));

describe("getTransport", () => {
  beforeEach(() => {
    vi.resetModules();
    createTransport.mockClear();
  });

  it("tidak membentuk koneksi sampai email pertama dikirim", async () => {
    const { getTransport } = await import("@/lib/mail/nodemailer");
    expect(createTransport).not.toHaveBeenCalled();
    getTransport();
    expect(createTransport).toHaveBeenCalledTimes(1);
  });

  it("memakai instance yang sama pada panggilan berikutnya", async () => {
    const { getTransport } = await import("@/lib/mail/nodemailer");
    expect(getTransport()).toBe(getTransport());
    expect(createTransport).toHaveBeenCalledTimes(1);
  });

  it("mengirim lewat driver dengan from, to, replyTo, dan html", async () => {
    const sendMail = vi.fn();
    createTransport.mockReturnValue({ sendMail });

    const { getTransport } = await import("@/lib/mail/nodemailer");
    await getTransport().send({
      to: "admin@otl.id",
      subject: "Halo",
      html: "<p>Hai</p>",
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "admin@otl.id",
        subject: "Halo",
        html: "<p>Hai</p>",
        replyTo: "no-reply@jelajahmemoria.com",
      }),
    );
    expect(sendMail.mock.calls[0][0].from).toContain("Jelajah Memoria");
  });
});