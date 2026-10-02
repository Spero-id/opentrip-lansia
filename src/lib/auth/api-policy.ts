import type { HttpMethod } from "./api-auth-audit";

export type ApiAccess = "public" | "session" | "admin";

export const API_ACCESS: Record<string, ApiAccess> = {
  "ALL /api/auth/[...all]": "public",
  "GET /api/trips": "public",
  "GET /api/trips/[id]/tiers": "public",
  "GET /api/blogs": "public",
  "GET /api/blogs/[id]": "public",
  "GET /api/reviews": "public",
  "GET /api/horeca-types": "public",
  "GET /api/vendor-types": "public",
  "GET /api/destinations/categories": "public",
  "POST /api/contact": "public",
  "POST /api/newsletter": "public",
  "GET /api/payments/accounts": "public",
  "GET /api/uploads/[...path]": "public",

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
  "POST /api/trips/[id]/groups/[groupId]/gallery": "admin",
  "DELETE /api/trips/[id]/groups/[groupId]/gallery/media/[mediaId]": "admin",
  "POST /api/trips/[id]/groups/[groupId]/gallery/media": "admin",
  "GET /api/trips/[id]/groups/[groupId]/prices": "admin",
  "POST /api/trips/[id]/groups/[groupId]/prices": "admin",
  "PUT /api/trips/[id]/groups/[groupId]/prices/[priceId]": "admin",
  "DELETE /api/trips/[id]/groups/[groupId]/prices/[priceId]": "admin",

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

export const DELEGATED_GUARD: Record<string, string> = {
  "POST /api/private-trips": "src/features/private-trip/private-trip.controller.ts",
  "GET /api/private-trips": "src/features/private-trip/private-trip.controller.ts",
  "GET /api/private-trips/[id]": "src/features/private-trip/private-trip.controller.ts",
  "POST /api/private-trips/[id]/respond": "src/features/private-trip/private-trip.controller.ts",
  "GET /api/bookings": "src/features/booking/booking.controller.ts",
  "GET /api/user/referral": "src/features/referral/referral.controller.ts",
  "GET /api/user/referral/history": "src/features/referral/referral.controller.ts",
  "POST /api/payments": "src/features/payment/payment.controller.ts",
  "POST /api/payments/[paymentId]/review": "src/features/payment/payment.controller.ts",
  "POST /api/payments/upload": "src/features/upload/upload.controller.ts",
  "DELETE /api/payments/upload": "src/features/upload/upload.controller.ts",
  "GET /api/bookings/[id]": "src/features/booking/booking.controller.ts",
  "PATCH /api/bookings/[id]": "src/features/booking/booking.controller.ts",
  "POST /api/checkout/validate-referral": "src/features/booking/checkout-referral.controller.ts",
  "POST /api/checkout": "src/features/booking/checkout.controller.ts",
  "POST /api/reviews": "src/features/review/review.controller.ts",
};

export function apiAccess(method: HttpMethod | string, path: string): ApiAccess {
  return (
    API_ACCESS[`${method} ${path}`] ??
    API_ACCESS[`ALL ${path}`] ??
    "session"
  );
}

export function isPublicApi(method: string, path: string): boolean {
  if (path === "/api/auth/[...all]" || path.startsWith("/api/auth/")) return true;
  return apiAccess(method, path) === "public";
}

const METHOD_GUESS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]);

function patternToRegex(routePattern: string): RegExp {
  let out = "";
  let i = 0;
  while (i < routePattern.length) {
    const ch = routePattern[i];
    if (ch === "[") {
      const close = routePattern.indexOf("]", i);
      const inner = routePattern.slice(i + 1, close);
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
