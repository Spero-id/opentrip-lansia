// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getSession = vi.fn();

vi.mock("@/features/auth/auth.config", () => ({
  auth: { api: { getSession } },
}));

async function load() {
  vi.resetModules();
  return import("@/lib/auth/session");
}

function request(): NextRequest {
  return new NextRequest("http://localhost/api/trips");
}

async function bodyOf(response: Response): Promise<{ error: string }> {
  return (await response.json()) as { error: string };
}

describe("getSessionUser", () => {
  beforeEach(() => {
    getSession.mockReset();
  });

  it("mengembalikan null saat tidak ada sesi", async () => {
    getSession.mockResolvedValue(null);
    const { getSessionUser } = await load();

    await expect(getSessionUser(request())).resolves.toBeNull();
  });

  it("mengembalikan id dan role dari sesi", async () => {
    getSession.mockResolvedValue({ user: { id: "u1", role: "admin" } });
    const { getSessionUser } = await load();

    await expect(getSessionUser(request())).resolves.toEqual({
      id: "u1",
      role: "admin",
    });
  });

  it("mengembalikan role undefined bila tidak ada di user", async () => {
    getSession.mockResolvedValue({ user: { id: "u1" } });
    const { getSessionUser } = await load();

    await expect(getSessionUser(request())).resolves.toEqual({
      id: "u1",
      role: undefined,
    });
  });

  it("mengembalikan null, bukan melempar, saat getSession error", async () => {
    getSession.mockRejectedValue(new Error("db down"));
    const { getSessionUser } = await load();

    await expect(getSessionUser(request())).resolves.toBeNull();
  });
});

describe("requireSession", () => {
  beforeEach(() => {
    getSession.mockReset();
  });

  it("mengembalikan null saat sesi ada", async () => {
    getSession.mockResolvedValue({ user: { id: "u1", role: "user" } });
    const { requireSession } = await load();

    await expect(requireSession(request())).resolves.toBeNull();
  });

  it("menolak dengan 401 tanpa sesi", async () => {
    getSession.mockResolvedValue(null);
    const { requireSession } = await load();

    const denied = await requireSession(request());

    expect(denied).not.toBeNull();
    expect(denied?.status).toBe(401);
    expect(await bodyOf(denied as Response)).toEqual({ error: "Unauthorized" });
  });

  it("menolak dengan 401 ketika getSession error", async () => {
    getSession.mockRejectedValue(new Error("db down"));
    const { requireSession } = await load();

    const denied = await requireSession(request());

    expect(denied?.status).toBe(401);
  });
});

describe("requireRole", () => {
  beforeEach(() => {
    getSession.mockReset();
  });

  it("mengizinkan role yang diminta", async () => {
    getSession.mockResolvedValue({ user: { id: "u1", role: "admin" } });
    const { requireRole } = await load();

    await expect(requireRole(request(), ["admin"])).resolves.toBeNull();
  });

  it("menolak dengan 403 bila role tidak termasuk", async () => {
    getSession.mockResolvedValue({ user: { id: "u1", role: "user" } });
    const { requireRole } = await load();

    const denied = await requireRole(request(), ["admin"]);

    expect(denied?.status).toBe(403);
    expect(await bodyOf(denied as Response)).toEqual({ error: "Forbidden" });
  });

  it("menolak dengan 401 tanpa sesi, bukan 403", async () => {
    getSession.mockResolvedValue(null);
    const { requireRole } = await load();

    const denied = await requireRole(request(), ["admin"]);

    expect(denied?.status).toBe(401);
  });

  it("menolak dengan 401 ketika getSession error", async () => {
    getSession.mockRejectedValue(new Error("boom"));
    const { requireRole } = await load();

    const denied = await requireRole(request(), ["admin"]);

    expect(denied?.status).toBe(401);
  });

  it("menolak user tanpa role sama sekali", async () => {
    getSession.mockResolvedValue({ user: { id: "u1" } });
    const { requireRole } = await load();

    const denied = await requireRole(request(), ["admin"]);

    expect(denied?.status).toBe(403);
  });
});

describe("requireAdmin", () => {
  beforeEach(() => {
    getSession.mockReset();
  });

  it("setara dengan requireRole admin", async () => {
    getSession.mockResolvedValue({ user: { id: "u1", role: "admin" } });
    const { requireAdmin } = await load();

    await expect(requireAdmin(request())).resolves.toBeNull();
  });

  it("menolak user biasa dengan 403", async () => {
    getSession.mockResolvedValue({ user: { id: "u1", role: "user" } });
    const { requireAdmin } = await load();

    const denied = await requireAdmin(request());

    expect(denied?.status).toBe(403);
  });
});