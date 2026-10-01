import { describe, expect, test } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { auditRoutes, isAllowedByPolicy } from "@/lib/auth";
import { API_ACCESS, DELEGATED_GUARD, resolveApiAccess } from "@/lib/auth";

const rootDir = process.cwd();
const rows = auditRoutes(rootDir);

const RANK = { public: 0, session: 1, admin: 2 } as const;

describe("API route protection audit", () => {
  test("the scanner discovers every route.ts file", () => {
    expect(rows.length).toBeGreaterThanOrEqual(90);
  });

  test("every handler is protected or public by design", () => {
    const violations = rows
      .filter((r) => !isAllowedByPolicy(r))
      .map((r) => `${r.route} (${r.file}:${r.line})`);
    expect(violations).toEqual([]);
  });

  test("protection levels satisfy policy (public < session < admin)", () => {
    const downgraded = rows
      .filter((r) => RANK[r.level] < RANK[r.required])
      .map((r) => `${r.route}: level=${r.level} < required=${r.required} (${r.file}:${r.line})`);
    expect(downgraded).toEqual([]);
  });

  test("no endpoint is silently opened to the public", () => {
    const publicRoutes = rows.filter((r) => r.required === "public").map((r) => r.route);
    expect(publicRoutes.length).toBeLessThanOrEqual(25);
    for (const r of rows.filter((r) => r.required === "public")) {
      if (r.route.includes("/api/auth/")) continue;
      expect(API_ACCESS[r.route]).toBeDefined();
    }
  });

  test("API_ACCESS has no stale entries", () => {
    const existing = new Set(rows.map((r) => r.route));
    const stale = Object.keys(API_ACCESS)
      .map((k) => (k.startsWith("ALL ") ? k.replace(/^ALL (\/api\/auth).*/, "GET $1/[...all]") : k))
      .filter((k) => !existing.has(k));
    expect(stale).toEqual([]);
  });

  test("DELEGATED_GUARD entries exist and their modules still check sessions", () => {
    const existing = new Set(rows.map((r) => r.route));
    const stale = Object.keys(DELEGATED_GUARD).filter((k) => !existing.has(k));
    expect(stale).toEqual([]);

    for (const spec of Object.values(DELEGATED_GUARD)) {
      const file = path.join(rootDir, spec);
      expect(fs.existsSync(file)).toBe(true);
      const src = fs.readFileSync(file, "utf8");
      expect(src).toMatch(
        /requireAdmin\s*\(|requireSession\s*\(|requireRole\s*\(|auth\.api\.getSession\s*\(/
      );
    }
  });
});

describe("resolveApiAccess (used by src/proxy.ts)", () => {
  test("public-by-design endpoints stay open to anonymous users", () => {
    expect(resolveApiAccess("GET", "/api/trips")).toBe("public");
    expect(resolveApiAccess("GET", "/api/blogs/abc")).toBe("public");
    expect(resolveApiAccess("GET", "/api/uploads/2026/01/x.png")).toBe("public");
    expect(resolveApiAccess("GET", "/api/auth/get-session")).toBe("public");
    expect(resolveApiAccess("POST", "/api/contact")).toBe("public");
    expect(resolveApiAccess("POST", "/api/private-trips")).toBe("session");
  });

  test("look-alike prefixes are not exposed (horeca vs horeca-types, upload vs uploads)", () => {
    expect(resolveApiAccess("GET", "/api/horeca-types")).toBe("public");
    expect(resolveApiAccess("GET", "/api/horeca")).toBe("admin");
    expect(resolveApiAccess("GET", "/api/horeca/abc")).toBe("admin");
    expect(resolveApiAccess("GET", "/api/uploads/x/y.png")).toBe("public");
    expect(resolveApiAccess("POST", "/api/upload")).toBe("admin");
  });

  test("dynamic admin routes are protected", () => {
    expect(resolveApiAccess("GET", "/api/trips/abc/groups")).toBe("admin");
    expect(resolveApiAccess("GET", "/api/users")).toBe("admin");
    expect(resolveApiAccess("GET", "/api/promotions")).toBe("session");
    expect(resolveApiAccess("PUT", "/api/promotions/xyz")).toBe("admin");
    expect(resolveApiAccess("GET", "/api/private-trips")).toBe("session");
    expect(resolveApiAccess("POST", "/api/private-trips/xyz/respond")).toBe("session");
  });

  test("unknown paths fail closed: session required", () => {
    expect(resolveApiAccess("GET", "/api/whatever-new")).toBe("session");
    expect(resolveApiAccess("POST", "/api/trips/abc/unknown-endpoint")).toBe("session");
    expect(resolveApiAccess("HEAD", "/api/trips")).toBe("public");
  });
});
