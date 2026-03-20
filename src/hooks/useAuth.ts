/**
 * useAuth.ts
 * ----------
 * Handles JWT token acquisition and validation.
 *
 * Flow:
 *  1. Check URL query param (host app redirects with ?token=...)
 *  2. Fall back to sessionStorage (already authenticated)
 *  3. [DEV ONLY] Fall back to VITE_DEV_TOKEN from .env.local
 *  4. Otherwise: surface an "Unauthorized" gate
 *
 * Token signature verification is the server's responsibility.
 * The client only decodes the payload for UX purposes (identity, expiry).
 *
 * Dev mode:
 *  Set VITE_DEV_TOKEN=<a valid jwt> in .env.local to skip the host-app
 *  redirect during local development. This env var must NOT be set in
 *  production — it will never be bundled unless explicitly defined.
 */

import { useState, useEffect } from "react";
import { APP_CONFIG } from "../config";
import { decodeJWT, isTokenValid } from "../utils/jwt";
import type { JWTPayload } from "../utils/jwt";

export type { JWTPayload };

export type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; token: string; payload: JWTPayload }
  | { status: "unauthenticated"; reason: string };

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    // 1. Check URL param — host app redirects with ?token=...
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
      } else {
        console.warn(
          "[useAuth] Token from URL query param could not be decoded — ignoring.",
        );
      }
    }

    // 2. Existing session in sessionStorage
    const stored = sessionStorage.getItem(APP_CONFIG.jwtStorageKey);
    if (stored) {
      const payload = decodeJWT(stored);
      if (payload) {
        if (!isTokenValid(stored)) {
          // Token is expired — evict it so the user hits the auth gate cleanly.
          sessionStorage.removeItem(APP_CONFIG.jwtStorageKey);
        } else {
          setAuthState({ status: "authenticated", token: stored, payload });
          return;
        }
      } else {
        // Token is malformed — evict it.
        sessionStorage.removeItem(APP_CONFIG.jwtStorageKey);
        console.warn("[useAuth] Stored token could not be decoded — evicted.");
      }
    }

    // 3. [DEV ONLY] Fall back to VITE_DEV_TOKEN
    const devToken = import.meta.env.VITE_DEV_TOKEN as string | undefined;
    if (devToken) {
      const payload = decodeJWT(devToken);
      if (payload && isTokenValid(devToken)) {
        console.info(
          "[useAuth] 🛠️  Dev mode: using VITE_DEV_TOKEN from .env.local",
        );
        setAuthState({ status: "authenticated", token: devToken, payload });
        return;
      } else {
        console.warn(
          "[useAuth] VITE_DEV_TOKEN is set but is invalid or expired — ignoring.",
        );
      }
    }

    // 4. No valid token found.
    setAuthState({
      status: "unauthenticated",
      reason:
        "No valid JWT token found. Please launch this page from the main application.",
    });
  }, []);

  return authState;
}
