// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

async function loadMail() {
  vi.resetModules();
  return import("@/lib/mail");
}

describe("mail (Resend)", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    send.mockReset();
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("RESEND_EMAIL_FROM", "onboarding@resend.dev");
    vi.stubEnv("ADMIN_EMAIL", "admin@example.com");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("mengirim contact us ke ADMIN_EMAIL dengan replyTo pengirim", async () => {
    send.mockResolvedValue({ data: { id: "email_1" }, error: null });
    const { sendContactEmail } = await loadMail();

    await sendContactEmail({
      name: "Budi",
      email: "budi@example.com",
      message: "Halo",
    });

    expect(send).toHaveBeenCalledTimes(1);
    const payload = send.mock.calls[0][0];
    expect(payload).toMatchObject({
      from: "Jelajah Memoria <onboarding@resend.dev>",
      to: "admin@example.com",
      replyTo: "budi@example.com",
      subject: "Pesan Baru dari Contact Us - Budi",
    });
    expect(payload.html).toContain("Budi");
  });

  it("melempar error bila Resend mengembalikan error", async () => {
    send.mockResolvedValue({
      data: null,
      error: { message: "domain belum diverifikasi" },
    });
    const { sendContactEmail } = await loadMail();

    await expect(
      sendContactEmail({ name: "Budi", email: "budi@example.com", message: "Halo" }),
    ).rejects.toThrow("domain belum diverifikasi");
  });

  it("memakai interpolasi RESEND_EMAIL_FROM pada email sambutan", async () => {
    send.mockResolvedValue({ data: { id: "email_2" }, error: null });
    const { sendSubscriptionConfirmationEmail } = await loadMail();

    await sendSubscriptionConfirmationEmail({ email: "warga@example.com" });

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Jelajah Memoria <onboarding@resend.dev>",
        to: "warga@example.com",
      }),
    );
  });
});
