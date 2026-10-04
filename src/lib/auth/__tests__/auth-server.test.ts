// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();
const redirect = vi.fn();

vi.mock("@/features/auth/auth.config", () => ({
  auth: { api: { getSession } },
}));

vi.mock("next/navigation", () => ({
  redirect: (target: string) => redirect(target),
}));

const requestHeaders = new Headers({ cookie: "session=abc" });

vi.mock("next/headers", () => ({
  headers: async () => requestHeaders,
}));

async function load() {
  vi.resetModules();
  return import("@/lib/auth/auth-server");
}

describe("requireAdminLayout", () => {
  beforeEach(() => {
    getSession.mockReset();
    redirect.mockReset();
    redirect.mockImplementation((target: string) => {
      throw new Error(`NEXT_REDIRECT:${target}`);
    });
  });

  it("mengembalikan sesi untuk admin", async () => {
    const session = { user: { id: "u1", role: "admin" } };
    getSession.mockResolvedValue(session);
    const { requireAdminLayout } = await load();

    await expect(requireAdminLayout()).resolves.toBe(session);
    expect(redirect).not.toHaveBeenCalled();
  });

  it("membaca header request milik Next, bukan objek buatan sendiri", async () => {
    getSession.mockResolvedValue({ user: { id: "u1", role: "admin" } });
    const { requireAdminLayout } = await load();

    await requireAdminLayout();

    expect(getSession).toHaveBeenCalledWith({ headers: requestHeaders });
  });

  it("mengalihkan ke login tanpa sesi, dengan tujuan redirect ter-encode", async () => {
    getSession.mockResolvedValue(null);
    const { requireAdminLayout } = await load();

    await expect(requireAdminLayout()).rejects.toThrow(
      "NEXT_REDIRECT:/login?redirect=%2Fadmin",
    );
  });

  it("mengalihkan ke forbidden untuk role selain admin", async () => {
    getSession.mockResolvedValue({ user: { id: "u1", role: "user" } });
    const { requireAdminLayout } = await load();

    await expect(requireAdminLayout()).rejects.toThrow(
      "NEXT_REDIRECT:/forbidden",
    );
  });

  it("mengalihkan ke forbidden untuk user tanpa role", async () => {
    getSession.mockResolvedValue({ user: { id: "u1" } });
    const { requireAdminLayout } = await load();

    await expect(requireAdminLayout()).rejects.toThrow(
      "NEXT_REDIRECT:/forbidden",
    );
  });

  it("membawa error dari getSession apa adanya, tidak menahannya", async () => {
    getSession.mockRejectedValue(new Error("session store down"));
    const { requireAdminLayout } = await load();

    await expect(requireAdminLayout()).rejects.toThrow("session store down");
    expect(redirect).not.toHaveBeenCalled();
  });
});