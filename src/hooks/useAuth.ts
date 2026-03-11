/**
 * useAuth.ts
 * ----------
 * Handles JWT token acquisition and validation.
 *
 * Flow:
 *  1. Check URL query param (host app redirect)
 *  2. Fall back to sessionStorage (already authenticated)
 *  3. In demoMode: generate a real signed token using jose
 *  4. Otherwise: show an "Unauthorized" gate
 */

import { useState, useEffect } from "react";
import { APP_CONFIG } from "../config";
import { generateDemoToken } from "../utils/generateDemoToken";

export type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; token: string; payload: JWTPayload }
  | { status: "unauthenticated"; reason: string };

export interface JWTPayload {
  sub: string;
  name?: string;
  email?: string;
  exp?: number;
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
        if (payload.exp && payload.exp < Date.now() / 1000) {
          sessionStorage.removeItem(APP_CONFIG.jwtStorageKey);
        } else {
          setAuthState({ status: "authenticated", token: stored, payload });
          return;
        }
      }
    }

    // 3. Demo mode — generate a real signed token
    if (APP_CONFIG.demoMode) {
      generateDemoToken(APP_CONFIG.jwtSecret).then((demoToken) => {
        const payload = decodeJWT(demoToken)!;
        sessionStorage.setItem(APP_CONFIG.jwtStorageKey, demoToken);
        setAuthState({ status: "authenticated", token: demoToken, payload });
      });
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
