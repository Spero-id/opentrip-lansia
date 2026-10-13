export const DEFAULT_REDIRECT = "/";

export interface RedirectOptions {
  allowAdmin?: boolean;
  fallback?: string;
}

export function sanitizeRedirectPath(
  value: string | null | undefined,
  options: RedirectOptions = {}
): string {
  const { allowAdmin = true, fallback = DEFAULT_REDIRECT } = options;
  if (
    value &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    (allowAdmin || !value.startsWith("/admin"))
  ) {
    return value;
  }
  return fallback;
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
