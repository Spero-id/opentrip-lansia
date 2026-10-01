export interface SubscribeNewsletterResult {
  ok: boolean;
  error?: string;
}

const SUBSCRIBE_ERROR_FALLBACK = "Terjadi kesalahan, coba lagi nanti";

export async function subscribeNewsletter(email: string): Promise<SubscribeNewsletterResult> {
  try {
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data: unknown = await res.json();
    if (!res.ok) {
      const message = (data as { error?: string })?.error || "Gagal berlangganan";
      return { ok: false, error: message };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: SUBSCRIBE_ERROR_FALLBACK };
  }
}
