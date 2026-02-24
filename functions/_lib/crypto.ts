import type { JwtPayload } from "./types";

// ─── PBKDF2 Password Hashing (Web Crypto API — Workers compatible) ───────────

async function importHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Hash a password using PBKDF2-HMAC-SHA256.
 * Returns a string in the format: "pbkdf2:310000:salt_hex:hash_hex"
 * 310,000 iterations meets OWASP minimum for PBKDF2-HMAC-SHA256 (2023).
 */
export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 310_000, hash: "SHA-256" },
    keyMaterial,
    256
  );

  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `pbkdf2:310000:${saltHex}:${hashHex}`;
}

/**
 * Verify a password against a stored hash string.
 * Uses constant-time comparison to prevent timing attacks.
 */
export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;

  const [, iterStr, saltHex, expectedHex] = parts;
  const iterations = parseInt(iterStr, 10);
  const enc = new TextEncoder();

  const saltBytes = new Uint8Array(
    saltHex.match(/.{2}/g)!.map((h) => parseInt(h, 16))
  );

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations, hash: "SHA-256" },
    keyMaterial,
    256
  );

  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time comparison
  if (hashHex.length !== expectedHex.length) return false;
  let diff = 0;
  for (let i = 0; i < hashHex.length; i++) {
    diff |= hashHex.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  }
  return diff === 0;
}

// ─── JWT (HS256 using Web Crypto HMAC-SHA256) ─────────────────────────────────

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(
    padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "=")
  );
  return new Uint8Array(Array.from(binary, (c) => c.charCodeAt(0)));
}

/**
 * Sign a JWT using HMAC-SHA256 (HS256).
 * Returns a compact JWT string.
 */
export async function signJwt(
  payload: Omit<JwtPayload, "iat" | "exp">,
  secret: string,
  expiresInSeconds: number
): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const enc = new TextEncoder();

  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const headerB64 = btoa(JSON.stringify(header))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  const payloadB64 = btoa(JSON.stringify(fullPayload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(signingInput)
  );

  return `${signingInput}.${base64UrlEncode(signature)}`;
}

/**
 * Verify a JWT signature and expiration.
 * Returns the payload if valid, null otherwise.
 */
export async function verifyJwt(
  token: string,
  secret: string
): Promise<JwtPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, sigB64] = parts;
  const enc = new TextEncoder();
  const key = await importHmacKey(secret);

  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlDecode(sigB64),
    enc.encode(`${headerB64}.${payloadB64}`)
  );

  if (!valid) return null;

  let payload: JwtPayload;
  try {
    payload = JSON.parse(
      atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))
    ) as JwtPayload;
  } catch {
    return null;
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload;
}

/**
 * Generate a cryptographically random refresh token (256 bits, hex-encoded).
 */
export function generateRefreshToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * SHA-256 hex hash of the refresh token for secure DB storage.
 * The raw token travels in cookies; only the hash is persisted.
 */
export async function hashRefreshToken(token: string): Promise<string> {
  const enc = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-256", enc.encode(token));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
