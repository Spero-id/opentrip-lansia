/**
 * Pemindai proteksi auth untuk semua route handler di src/app/api (route.ts).
 *
 * Dipakai dua arah:
 *  - `scripts/api-auth-audit.ts` -> mencetak tabel audit (inventaris)
 *  - test `src/__tests__/api-auth-audit.test.ts` -> mengunci supaya endpoint
 *    baru tanpa proteksi gagal di CI (regresi dari temuan "57 endpoint public")
 *
 * Heuristik: sebuah handler dianggap TERLINDUNGI jika
 *  1. tubuhnya memanggil requireAdmin/requireSession/requireRole/
 *     auth.api.getSession, ATAU
 *  2. route.ts hanya mendaftar ulang export dari controller
 *     (`export { GET } from "..."`) DAN fungsi itu di modulnya punya cek
 *     session (lihat DELEGATED_GUARD di api-policy.ts).
 *
 * Tingkat akses yang DISYARATKAN ada di api-policy.ts; test membandingkan
 * `level` (hasil pemindaian) dengan `apiAccess()` (kebijakan).
 */
import fs from "node:fs";
import path from "node:path";
import { apiAccess, isPublicApi, DELEGATED_GUARD, type ApiAccess } from "./api-policy";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type GuardLevel = ApiAccess;

export interface RouteAudit {
  /** Contoh: GET /api/trips/[id] */
  route: string;
  file: string;
  method: HttpMethod;
  guarded: boolean;
  /** Tingkat proteksi yang terdeteksi di tubuh handler */
  level: GuardLevel;
  /** Tingkat proteksi yang disyaratkan kebijakan (api-policy.ts) */
  required: ApiAccess;
  /** Baris deklarasi handler, untuk laporan */
  line: number;
}

const HANDLER_RE =
  /export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(|export\s+const\s+(GET|POST|PUT|PATCH|DELETE)\s*[:=]/g;

const RE_EXPORT_RE = /export\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g;

const GUARD_RE =
  /\brequireAdmin\s*\(|\brequireSession\s*\(|\brequireRole\s*\(|\bauth\.api\.getSession\s*\(/;
const ADMIN_RE = /\brequireAdmin\s*\(|\brequireRole\s*\([^)]*["']admin["']/;

export function routePathFromFile(file: string): string {
  const rel = file.replace(/\\/g, "/");
  const idx = rel.indexOf("src/app/");
  const dir = rel.slice(idx + "src/app".length).replace(/\/route\.ts$/, "").replace(/\/route\.tsx$/, "");
  return dir.startsWith("/") ? dir : `/${dir}`;
}

/** Resolve path modul: "@/modules/x" maupun "src/modules/x". */
function resolveModule(spec: string, rootDir: string): string | null {
  const base = spec.startsWith("@/")
    ? path.join(rootDir, "src", spec.slice(2))
    : path.isAbsolute(spec)
      ? spec
      : path.join(rootDir, spec);
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/** Cari fungsi ber-export di modul target, lalu ukur tubuhnya. */
function levelOfExportedHandler(moduleFile: string, method: string): GuardLevel | null {
  const src = fs.readFileSync(moduleFile, "utf8");
  const re = new RegExp(HANDLER_RE.source, "g");
  const matches = [...src.matchAll(re)];
  const hit = matches.find((m) => (m[1] ?? m[2]) === method);
  if (!hit) return null;
  const start = hit.index!;
  const next = matches[matches.indexOf(hit) + 1];
  const body = src.slice(start, next ? next.index : src.length);
  if (!GUARD_RE.test(body)) return null;
  return ADMIN_RE.test(body) ? "admin" : "session";
}

export function auditRoutes(rootDir = process.cwd()): RouteAudit[] {
  const apiDir = path.join(rootDir, "src", "app", "api");
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === "route.ts" || entry.name === "route.tsx") files.push(full);
    }
  };
  walk(apiDir);

  const results: RouteAudit[] = [];
  for (const file of files.sort()) {
    const src = fs.readFileSync(file, "utf8");
    const relFile = file.replace(/\\/g, "/").replace(rootDir.replace(/\\/g, "/"), "").replace(/^\//, "");
    const routePath = routePathFromFile(file);
    const push = (method: string, guardedInBody: boolean, bodyLevel: GuardLevel, line: number) => {
      const route = `${method} ${routePath}`;
      let guarded = guardedInBody;
      let level = bodyLevel;
      // Proteksi ada di controller (route.ts cuma meneruskan)
      if (!guarded) {
        const spec = DELEGATED_GUARD[route];
        if (spec) {
          const modFile = resolveModule(spec, rootDir);
          const modSrc = modFile ? fs.readFileSync(modFile, "utf8") : "";
          if (GUARD_RE.test(modSrc)) {
            guarded = true;
            // Cek session di controller = setara "session". Kalau suatu saat ada
            // route delegated yang disyaratkan "admin", test akan gagal — itu
            // disengaja: proteksi role harus eksplisit di route.ts.
            level = "session";
          }
        }
      }
      results.push({
        route,
        file: relFile,
        method: method as HttpMethod,
        guarded,
        level,
        required: apiAccess(method, routePath),
        line,
      });
    };

    // Kasus 1: handler didefinisikan langsung di route.ts
    const matches = [...src.matchAll(HANDLER_RE)];
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      const method = m[1] ?? m[2];
      const start = m.index!;
      const end = i + 1 < matches.length ? matches[i + 1].index! : src.length;
      const body = src.slice(start, end);
      const line = src.slice(0, start).split("\n").length;
      const guarded = GUARD_RE.test(body);
      push(method, guarded, !guarded ? "public" : ADMIN_RE.test(body) ? "admin" : "session", line);
    }

    // Kasus 2: route.ts hanya mendaftar ulang export dari controller
    if (matches.length === 0) {
      for (const m of src.matchAll(RE_EXPORT_RE)) {
        const names = m[1].split(",").map((s) => s.trim().split(/\s+as\s+/)[0]);
        const modFile = resolveModule(m[2], rootDir);
        const line = src.slice(0, m.index!).split("\n").length;
        for (const name of names) {
          if (!/^(GET|POST|PUT|PATCH|DELETE)$/.test(name)) continue;
          const level = modFile ? levelOfExportedHandler(modFile, name) : null;
          push(name, level !== null, level ?? "public", line);
        }
      }
    }
  }
  return results;
}

export function isAllowedByPolicy(audit: RouteAudit): boolean {
  return audit.guarded || audit.required === "public";
}

export function isPublicApiPath(method: string, path: string): boolean {
  return isPublicApi(method, path);
}
