/**
 * KEBIJAKAN PROTEKSI API — source of truth.
 *
 * Definisi: setiap handler di src/app/api wajib punya tingkat akses yang
 * jelas. Modul ini dipakai dua arah:
 *  - `src/proxy.ts`    -> penjagaan awal di edge (cookie check, murah)
 *  - `src/shared/auth/api-auth-audit.ts` + test `src/__tests__/api-auth-audit.test.ts`
 *      -> pemindaian statis tiap handler: wajib terlindungi, kecuali public
 *
 * Tingkat akses (urut naik):
 *  - "public" : siapa pun, termasuk anonim. HARUS eksplisit di daftar.
 *  - "session": wajib login (requireSession / cek session di controller).
 *  - "admin"  : wajib login + role admin (requireAdmin/requireRole).
 *
 * Default untuk handler yang tidak terdaftar: "session" (fail-closed).
 * Route yang proteksinya ada di dalam controller (bukan di route.ts)
 * tercantum di DELEGATED_GUARD beserta modulnya.
 *
 * Catatan keputusan audit 2026-09-30:
 *  - GET /api/trips, /api/blogs*, /api/reviews bersifat public KONDISIONAL
 *    (branch anonim hanya data published/approved, branch admin pakai
 *    requireAdmin di handler yang sama) -> dinyatakan "public".
 *  - GET /api/trips/[id]/active-group tidak punya konsumen saat ini ->
 *    admin (longgarkan bila nanti ada halaman publik yang memakainya).
 */
import type { HttpMethod } from "./api-auth-audit";

export type ApiAccess = "public" | "session" | "admin";

/**
 * Entri eksplisit. Kunci: "METHOD /api/path" (pola dynamic route apa adanya).
 * Sisanya default "session".
 */
export const API_ACCESS: Record<string, ApiAccess> = {
  // ── Public by design ──────────────────────────────────────────────
  // Better Auth (login/register/session) — tidak bisa diproteksi session
  "ALL /api/auth/[...all]": "public",
  // Katalog & konten publik (branch admin ditangani di dalam handler)
  "GET /api/trips": "public",
  "GET /api/blogs": "public",
  "GET /api/blogs/[id]": "public",
  "GET /api/reviews": "public",
  "GET /api/horeca-types": "public",
  "GET /api/vendor-types": "public",
  "GET /api/destinations/categories": "public",
  // Formulir kontak / newsletter (siapa pun boleh kirim)
  "POST /api/contact": "public",
  "POST /api/newsletter": "public",
  // Nomor rekening & QRIS untuk halaman pembayaran (konsumen butuh tanpa login)
  "GET /api/payments/accounts": "public",
  // Penyajian file hasil upload (dipakai <img src>)
  "GET /api/uploads/[...path]": "public",

  // ── Admin only ────────────────────────────────────────────────────
  "GET /api/admin/dashboard": "admin",
  "GET /api/admin/notifications": "admin",
  "POST /api/admin/notifications/read-all": "admin",
  "PATCH /api/admin/notifications/[id]/read": "admin",
  "GET /api/admin/site-settings": "admin",
  "PUT /api/admin/site-settings": "admin",
  "GET /api/admin/site-settings/referral-bonus": "admin",

  "GET /api/users": "admin",
  "PUT /api/users/[id]": "admin",
  "DELETE /api/users/[id]": "admin",

  "GET /api/commissions": "admin",
  "POST /api/commissions": "admin",
  "GET /api/commissions/[id]": "admin",
  "PUT /api/commissions/[id]": "admin",
  "DELETE /api/commissions/[id]": "admin",

  "GET /api/private-trip/admin": "admin",
  "GET /api/private-trip/admin/[id]": "admin",
  "PATCH /api/private-trip/admin/[id]": "admin",
  "POST /api/private-trip/admin/[id]/proposals": "admin",

  "POST /api/trips": "admin",
  "PUT /api/trips/[id]": "admin",
  "DELETE /api/trips/[id]": "admin",
  "POST /api/trips/[id]/groups": "admin",
  "PUT /api/trips/[id]/groups/[groupId]": "admin",
  "DELETE /api/trips/[id]/groups/[groupId]": "admin",
  "PUT /api/trips/[id]/groups/[groupId]/activate": "admin",
  "PUT /api/trips/[id]/groups/[groupId]/complete": "admin",
  "GET /api/trips/[id]/groups": "admin",
  "GET /api/trips/[id]/groups/[groupId]/participants": "admin",
  "GET /api/trips/[id]/active-group": "admin",
  "POST /api/trips/[id]/groups/[groupId]/gallery": "admin",
  "DELETE /api/trips/[id]/groups/[groupId]/gallery/media/[mediaId]": "admin",
  "POST /api/trips/[id]/groups/[groupId]/gallery/media": "admin",

  "GET /api/galleries": "admin",
  "GET /api/galleries/[id]": "admin",
  "POST /api/galleries": "admin",
  "PUT /api/galleries/[id]": "admin",
  "DELETE /api/galleries/[id]": "admin",

  "GET /api/horeca": "admin",
  "GET /api/horeca/[id]": "admin",
  "POST /api/horeca": "admin",
  "PUT /api/horeca/[id]": "admin",
  "DELETE /api/horeca/[id]": "admin",

  "GET /api/vendors": "admin",
  "GET /api/vendors/[id]": "admin",
  "POST /api/vendors": "admin",
  "PUT /api/vendors/[id]": "admin",
  "DELETE /api/vendors/[id]": "admin",

  "POST /api/promotions": "admin",
  "GET /api/promotions/[id]": "admin",
  "PUT /api/promotions/[id]": "admin",
  "DELETE /api/promotions/[id]": "admin",

  "POST /api/blogs": "admin",
  "PUT /api/blogs/[id]": "admin",
  "DELETE /api/blogs/[id]": "admin",

  "POST /api/destinations/categories": "admin",
  "POST /api/upload": "admin",
  "DELETE /api/upload": "admin",
  "PUT /api/reviews/[id]": "admin",
  "DELETE /api/reviews/[id]": "admin",
};

/**
 * Handler yang mendelegasikan proteksi ke controller (route.ts hanya
 * meneruskan). Test membaca modul ini dan memastikan masih ada cek session.
 */
export const DELEGATED_GUARD: Record<string, string> = {
  "POST /api/private-trips": "src/modules/private-trip/private-trip.controller.ts",
  "GET /api/private-trips": "src/modules/private-trip/private-trip.controller.ts",
  "GET /api/private-trips/[id]": "src/modules/private-trip/private-trip.controller.ts",
  "POST /api/private-trips/[id]/respond": "src/modules/private-trip/private-trip.controller.ts",
  "GET /api/bookings": "src/modules/booking/booking.controller.ts",
};

/** Tingkat akses yang disyaratkan untuk satu handler. Default: session. */
export function apiAccess(method: HttpMethod | string, path: string): ApiAccess {
  return (
    API_ACCESS[`${method} ${path}`] ??
    API_ACCESS[`ALL ${path}`] ??
    "session"
  );
}

/** True kalau endpoint boleh dipanggil tanpa session (untuk proxy). */
export function isPublicApi(method: string, path: string): boolean {
  if (path === "/api/auth/[...all]" || path.startsWith("/api/auth/")) return true;
  return apiAccess(method, path) === "public";
}

// ── Penerapan kebijakan pada path asli (dipakai src/proxy.ts) ──────────
// Policy disimpan sebagai pola route ("/api/trips/[id]/groups"), sedangkan
// proxy melihat path asli ("/api/trips/abc/groups"). Pola diterjemahkan ke
// regex: [x] -> segmen tunggal, [...x] -> sisa path.
const METHOD_GUESS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]);

function patternToRegex(routePattern: string): RegExp {
  let out = "";
  let i = 0;
  while (i < routePattern.length) {
    const ch = routePattern[i];
    if (ch === "[") {
      const close = routePattern.indexOf("]", i);
      const inner = routePattern.slice(i + 1, close);
      // [...param] -> sisa path; [param] -> satu segmen
      out += inner.startsWith("...") ? ".*" : "[^/]+";
      i = close + 1;
      continue;
    }
    out += /[.*+?^${}()|[\]\\]/.test(ch) ? `\\${ch}` : ch;
    i += 1;
  }
  return new RegExp(`^${out}$`);
}

const ACCESS_RULES: { method: string | null; re: RegExp; access: ApiAccess }[] =
  Object.entries(API_ACCESS).map(([key, access]) => {
    const all = key.startsWith("ALL ");
    const rest = all ? key.slice(4) : key.slice(key.indexOf(" ") + 1);
    const method = all ? null : key.slice(0, key.indexOf(" "));
    return { method, re: patternToRegex(rest), access };
  });

/**
 * Akses yang disyaratkan untuk path asli + method. Default "session"
 * (fail-closed): path yang tidak dikenal kebijakan = wajib login.
 */
export function resolveApiAccess(method: string, pathname: string): ApiAccess {
  const m = method === "HEAD" ? "GET" : method;
  if (!METHOD_GUESS.has(m)) return "session";
  if (pathname === "/api/auth/[...all]" || pathname.startsWith("/api/auth/")) return "public";
  for (const rule of ACCESS_RULES) {
    if (rule.method !== null && rule.method !== m) continue;
    if (rule.re.test(pathname)) return rule.access;
  }
  return "session";
}
