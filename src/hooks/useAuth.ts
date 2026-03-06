/**
 * useAuth.ts
 * ----------
 * Handles JWT token acquisition and validation.
 *
 * Flow:
 *  1. Check URL query param (host app redirect)
 *  2. Fall back to sessionStorage (already authenticated)
 *  3. In demoMode: auto-generate a fake token so the page just works
 *  4. Otherwise: show an "Unauthorized" gate
 */

import { useState, useEffect } from "react";
import { APP_CONFIG } from "../config";

export type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; token: string; payload: JWTPayload }
  | { status: "unauthenticated"; reason: string };

export interface JWTPayload {
  sub: string; // user id
  name?: string; // display name
  email?: string;
  exp?: number; // expiry unix timestamp
  iat?: number;
  [key: string]: unknown;
}

/** Cheap base64url decode (no signature verification in demo). */
function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(payload);
    return JSON.parse(json) as JWTPayload;
  } catch {
    return null;
  }
}

/** Creates a fake JWT for demo purposes only. */
function makeDemoToken(): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: "demo-user-001",
      name: "Demo User",
      email: "demo@hwl.com",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  );
  const sig = btoa("demo-signature");
  return `${header}.${payload}.${sig}`;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    // 1. Check URL param (host app redirects with ?token=...)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get(APP_CONFIG.jwtParamName);

    if (urlToken) {
      const payload = decodeJWT(urlToken);
      if (payload) {
        sessionStorage.setItem(APP_CONFIG.jwtStorageKey, urlToken);
        // Clean token from URL without reload
        params.delete(APP_CONFIG.jwtParamName);
        const cleanUrl =
          window.location.pathname +
          (params.toString() ? `?${params}` : "") +
          window.location.hash;
        window.history.replaceState({}, "", cleanUrl);
        setAuthState({ status: "authenticated", token: urlToken, payload });
        return;
      }
    }

    // 2. Existing session
    const stored = sessionStorage.getItem(APP_CONFIG.jwtStorageKey);
    if (stored) {
      const payload = decodeJWT(stored);
      if (payload) {
        // Check expiry
        if (payload.exp && payload.exp < Date.now() / 1000) {
          sessionStorage.removeItem(APP_CONFIG.jwtStorageKey);
        } else {
          setAuthState({ status: "authenticated", token: stored, payload });
          return;
        }
      }
    }

    // 3. Demo mode auto-auth
    if (APP_CONFIG.demoMode) {
      const demoToken = makeDemoToken();
      const payload = decodeJWT(demoToken)!;
      sessionStorage.setItem(APP_CONFIG.jwtStorageKey, demoToken);
      setAuthState({ status: "authenticated", token: demoToken, payload });
      return;
    }

    // 4. Not authenticated
    setAuthState({
      status: "unauthenticated",
      reason:
        "No valid JWT token found. Please launch this page from the main application.",
    });
  }, []);

  return authState;
}
