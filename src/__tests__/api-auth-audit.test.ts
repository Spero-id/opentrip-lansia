/**
 * Regression lock untuk proteksi API (feat-080: API auth middleware & RBAC).
 *
 * Memastikan:
 *  1. Setiap handler di src/app/api punya proteksi, KECUALI yang memang
 *     public by design (terdaftar di api-policy.ts).
 *  2. Tingkat proteksi terdeteksi >= yang disyaratkan kebijakan
 *     (public < session < admin) — mis. endpoint admin tidak boleh
 *     diturunkan jadi session.
 *  3. Entri kebijakan tidak basi (setiap entri menunjuk handler yang ada).
 *  4. Route yang mendelegasikan ke controller (DELEGATED_GUARD) masih
 *     punya cek session di modulnya.
 *  5. Pola route diterjemahkan benar ke regex untuk src/proxy.ts
 *     (guard edge memakai resolveApiAccess).
 */
import { describe, expect, test } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { auditRoutes, isAllowedByPolicy } from "@/shared/auth/api-auth-audit";
import {
  API_ACCESS,
  DELEGATED_GUARD,
  resolveApiAccess,
} from "@/shared/auth/api-policy";

const rootDir = process.cwd();
const rows = auditRoutes(rootDir);

const RANK = { public: 0, session: 1, admin: 2 } as const;

describe("audit proteksi API", () => {
  test("semua route.ts terbaca pemindai", () => {
    expect(rows.length).toBeGreaterThanOrEqual(90);
  });

  test("setiap handler terlindungi atau public by design", () => {
    const violations = rows
      .filter((r) => !isAllowedByPolicy(r))
      .map((r) => `${r.route} (${r.file}:${r.line})`);
    expect(violations).toEqual([]);
  });

  test("tingkat proteksi memenuhi kebijakan (public < session < admin)", () => {
    const downgraded = rows
      .filter((r) => RANK[r.level] < RANK[r.required])
      .map((r) => `${r.route}: level=${r.level} < required=${r.required} (${r.file}:${r.line})`);
    expect(downgraded).toEqual([]);
  });

  test("tidak ada endpoint yang diam-diam dibuka untuk publik", () => {
    // Baris baru di API_ACCESS berarti kebijakan publik harus disengaja.
    const publicRoutes = rows.filter((r) => r.required === "public").map((r) => r.route);
    expect(publicRoutes.length).toBeLessThanOrEqual(25);
    for (const r of rows.filter((r) => r.required === "public")) {
      // /api/auth/... ditandai lewat entri "ALL /api/auth/[...all]"
      if (r.route.includes("/api/auth/")) continue;
      expect(API_ACCESS[r.route]).toBeDefined();
    }
  });

  test("entri API_ACCESS tidak basi", () => {
    const existing = new Set(rows.map((r) => r.route));
    const stale = Object.keys(API_ACCESS)
      .map((k) => (k.startsWith("ALL ") ? k.replace(/^ALL (\/api\/auth).*/, "GET $1/[...all]") : k))
      .filter((k) => !existing.has(k));
    expect(stale).toEqual([]);
  });

  test("entri DELEGATED_GUARD ada dan modulnya masih mengecek session", () => {
    const existing = new Set(rows.map((r) => r.route));
    const stale = Object.keys(DELEGATED_GUARD).filter((k) => !existing.has(k));
    expect(stale).toEqual([]);

    for (const [route, spec] of Object.entries(DELEGATED_GUARD)) {
      const file = path.join(rootDir, spec);
      expect(fs.existsSync(file)).toBe(true);
      const src = fs.readFileSync(file, "utf8");
      expect(src).toMatch(
        /requireAdmin\s*\(|requireSession\s*\(|requireRole\s*\(|auth\.api\.getSession\s*\(/
      );
      void route;
    }
  });
});

describe("resolveApiAccess (dipakai src/proxy.ts)", () => {
  test("endpoint public by design tetap terbuka untuk anonim", () => {
    expect(resolveApiAccess("GET", "/api/trips")).toBe("public");
    expect(resolveApiAccess("GET", "/api/blogs/abc")).toBe("public");
    expect(resolveApiAccess("GET", "/api/uploads/2026/01/x.png")).toBe("public");
    expect(resolveApiAccess("GET", "/api/auth/get-session")).toBe("public");
    expect(resolveApiAccess("POST", "/api/contact")).toBe("public");
    expect(resolveApiAccess("POST", "/api/private-trips")).toBe("session");
  });

  test("prefix mirip tidak ikut terbuka (horeca vs horeca-types, upload vs uploads)", () => {
    expect(resolveApiAccess("GET", "/api/horeca-types")).toBe("public");
    expect(resolveApiAccess("GET", "/api/horeca")).toBe("admin");
    expect(resolveApiAccess("GET", "/api/horeca/abc")).toBe("admin");
    expect(resolveApiAccess("GET", "/api/uploads/x/y.png")).toBe("public");
    expect(resolveApiAccess("POST", "/api/upload")).toBe("admin");
  });

  test("route dinamis admin terlindungi", () => {
    expect(resolveApiAccess("GET", "/api/trips/abc/groups")).toBe("admin");
    expect(resolveApiAccess("GET", "/api/users")).toBe("admin");
    expect(resolveApiAccess("GET", "/api/promotions")).toBe("session");
    expect(resolveApiAccess("PUT", "/api/promotions/xyz")).toBe("admin");
    expect(resolveApiAccess("GET", "/api/private-trips")).toBe("session");
    expect(resolveApiAccess("POST", "/api/private-trips/xyz/respond")).toBe("session");
  });

  test("path tak dikenal gagal-closed: wajib session", () => {
    expect(resolveApiAccess("GET", "/api/whatever-new")).toBe("session");
    expect(resolveApiAccess("POST", "/api/trips/abc/unknown-endpoint")).toBe("session");
    expect(resolveApiAccess("HEAD", "/api/trips")).toBe("public");
  });
});
