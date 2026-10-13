import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUserMock, redirectMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: getCurrentUserMock,
}));

vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();
  return { ...actual, redirect: redirectMock };
});

vi.mock("@/lib/auth/client", () => ({
  signIn: { email: vi.fn(), social: vi.fn() },
  signUp: { email: vi.fn() },
  useSession: vi.fn(),
}));

import LoginPage from "@/app/(auth)/login/page";
import RegisterPage from "@/app/(auth)/register/page";

function search(redirect?: string) {
  return Promise.resolve(redirect ? { redirect } : {});
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LoginPage guard RSC", () => {
  it("tanpa session → render form, tidak redirect", async () => {
    getCurrentUserMock.mockResolvedValue(null);

    const element = await LoginPage({ searchParams: search() });

    expect(element).toBeTruthy();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("sudah session → redirect ke beranda", async () => {
    getCurrentUserMock.mockResolvedValue({ id: "u1" });

    await LoginPage({ searchParams: search() });

    expect(redirectMock).toHaveBeenCalledWith("/");
  });

  it("sudah session → meneruskan redirect yang aman", async () => {
    getCurrentUserMock.mockResolvedValue({ id: "u1" });

    await LoginPage({ searchParams: search("/trips") });

    expect(redirectMock).toHaveBeenCalledWith("/trips");
  });

  it("sudah session → redirect tidak aman jatuh ke beranda", async () => {
    getCurrentUserMock.mockResolvedValue({ id: "u1" });

    await LoginPage({ searchParams: search("//evil.com") });

    expect(redirectMock).toHaveBeenCalledWith("/");
  });

  it("redirect array dari query string jatuh ke beranda", async () => {
    getCurrentUserMock.mockResolvedValue({ id: "u1" });

    await LoginPage({
      searchParams: Promise.resolve({ redirect: ["/trips", "/admin"] }),
    });

    expect(redirectMock).toHaveBeenCalledWith("/");
  });
});

describe("RegisterPage guard RSC", () => {
  it("tanpa session → render form, tidak redirect", async () => {
    getCurrentUserMock.mockResolvedValue(null);

    const element = await RegisterPage({ searchParams: search() });

    expect(element).toBeTruthy();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("sudah session → redirect ke beranda", async () => {
    getCurrentUserMock.mockResolvedValue({ id: "u1" });

    await RegisterPage({ searchParams: search() });

    expect(redirectMock).toHaveBeenCalledWith("/");
  });

  it("sudah session → meneruskan redirect yang aman", async () => {
    getCurrentUserMock.mockResolvedValue({ id: "u1" });

    await RegisterPage({ searchParams: search("/trips") });

    expect(redirectMock).toHaveBeenCalledWith("/trips");
  });

  it("sudah session → /admin ditolak (allowAdmin false)", async () => {
    getCurrentUserMock.mockResolvedValue({ id: "u1" });

    await RegisterPage({ searchParams: search("/admin") });

    expect(redirectMock).toHaveBeenCalledWith("/");
  });
});
