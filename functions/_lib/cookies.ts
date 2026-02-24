export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const ACCESS_TOKEN_TTL = 60 * 15; // 15 minutes
export const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 7; // 7 days

/**
 * Parse a Cookie header string into a key-value map.
 */
export function parseCookies(
  cookieHeader: string | null
): Record<string, string> {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k.trim(), decodeURIComponent(v.join("="))];
    })
  );
}

interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  path?: string;
  maxAge?: number; // seconds
}

/**
 * Serialize a cookie into a Set-Cookie header value.
 */
export function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  return parts.join("; ");
}
