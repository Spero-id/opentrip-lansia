export const DEFAULT_REDIRECT = "/";

export interface RedirectOptions {
  allowAdmin?: boolean;
  fallback?: string;
}

const PARSE_BASE = "http://n";

export function sanitizeRedirectPath(
  value: string | null | undefined,
  options: RedirectOptions = {}
): string {
  const { allowAdmin = true, fallback = DEFAULT_REDIRECT } = options;
  if (!value) return fallback;
  try {
    const url = new URL(value, PARSE_BASE);
    if (url.origin !== PARSE_BASE) return fallback;
    const path = url.pathname + url.search + url.hash;
    if (!path.startsWith("/")) return fallback;
    if (!allowAdmin && path.startsWith("/admin")) return fallback;
    return path;
  } catch {
    return fallback;
  }
}

export function readRedirectFromSearch(
  search: string,
  options?: RedirectOptions
): string {
  return sanitizeRedirectPath(
    new URLSearchParams(search).get("redirect"),
    options
  );
}

export function buildAuthHref(basePath: string, redirectPath: string): string {
  if (redirectPath === "/admin" || redirectPath === DEFAULT_REDIRECT) {
    return basePath;
  }
  const qs = new URLSearchParams({ redirect: redirectPath }).toString();
  return `${basePath}?${qs}`;
}
