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
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    256
  );

  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `pbkdf2:100000:${saltHex}:${hashHex}`;
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
    base64UrlDecode(sigB64).buffer as ArrayBuffer,
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

// ─── AES-GCM secret box (third-party API credentials at rest) ─────────────────
//
// Marketplace connectors hold customer-owned secrets (Stripe secret keys,
// Calendly PATs…). Those are reversible by design — the worker must replay them
// on every outbound call — so they are encrypted with AES-256-GCM instead of
// hashed. The key is derived from an env secret; the ciphertext is
// self-describing so the format can be rotated later.

const SECRET_BOX_PREFIX = "aesgcm.v1";

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return new Uint8Array(Array.from(binary, (c) => c.charCodeAt(0)));
}

async function deriveSecretBoxKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  // Domain-separated so the same env secret can also sign JWTs safely.
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(`pulse.secretbox.v1:${secret}`));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

/** Encrypt a UTF-8 string. Returns "aesgcm.v1.<iv_b64>.<ciphertext_b64>". */
export async function encryptSecret(plaintext: string, secret: string): Promise<string> {
  const key = await deriveSecretBoxKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  return `${SECRET_BOX_PREFIX}.${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(ciphertext))}`;
}

/** Decrypt a value produced by encryptSecret. Returns null when unreadable. */
export async function decryptSecret(payload: string, secret: string): Promise<string | null> {
  const parts = payload.split(".");
  if (parts.length !== 4 || `${parts[0]}.${parts[1]}` !== SECRET_BOX_PREFIX) return null;

  try {
    const key = await deriveSecretBoxKey(secret);
    const iv = base64ToBytes(parts[2]);
    const ciphertext = base64ToBytes(parts[3]);
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as unknown as ArrayBuffer },
      key,
      ciphertext as unknown as ArrayBuffer
    );
    return new TextDecoder().decode(plaintext);
  } catch {
    return null;
  }
}

/** Encrypt a JSON-serialisable record (used for connector credential bags). */
export async function encryptJson(value: Record<string, unknown>, secret: string): Promise<string> {
  return encryptSecret(JSON.stringify(value), secret);
}

/** Decrypt a record written by encryptJson. Returns {} when unreadable. */
export async function decryptJson(payload: string | null, secret: string): Promise<Record<string, string>> {
  if (!payload) return {};
  const plaintext = await decryptSecret(payload, secret);
  if (!plaintext) return {};
  try {
    const parsed = JSON.parse(plaintext);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}
