/**
 * jwt.ts
 * ------
 * Shared JWT utilities used by both useAuth (validation on load)
 * and api.ts (pre-flight expiry check before every request).
 *
 * Signature verification is the server's responsibility.
 * The browser only decodes the payload for UX purposes (expiry, identity).
 */

export interface JWTPayload {
  sub: string;
  name?: string;
  email?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * Decodes the payload section of a JWT without verifying its signature.
 * Returns null if the token is structurally invalid or cannot be parsed.
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Base64url → base64 → decode
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    return JSON.parse(atob(padded)) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Returns true if the token is structurally valid AND not yet expired.
 * Tokens without an `exp` claim are treated as non-expiring.
 * Applies a 30-second clock skew buffer — a token is still considered valid
 * for up to 30 seconds after its `exp` timestamp (handles server/client drift).
 */
export function isTokenValid(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload) return false;

  const SKEW_SECONDS = 30;
  if (
    payload.exp !== undefined &&
    payload.exp + SKEW_SECONDS < Date.now() / 1000
  ) {
    return false;
  }

  return true;
}
