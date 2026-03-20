/**
 * config.ts
 * ---------
 * Single source of truth for all run-time configuration.
 * In production, swap the values here (or read from env vars) — zero other files need editing.
 */

export const APP_CONFIG = {
  // ── API ───────────────────────────────────────────────
  apiUrl: import.meta.env.VITE_API_URL as string | undefined,

  // ── Branding ─────────────────────────────────────────
  title: "HWL Assistant",
  subtitle: "Your intelligent guide",
  primaryColor: "#0052CC",
  logoUrl: null as string | null, // set to a URL to show a custom logo

  // ── JWT auth ─────────────────────────────────────────
  /**
   * The host app passes a signed JWT via the URL query param (`?token=...`).
   * On subsequent loads the token is read from sessionStorage.
   */
  jwtParamName: "token", // URL query param name the host app passes
  jwtStorageKey: "hwl_jwt_token",

  // ── Chat defaults ─────────────────────────────────────
  placeholder: "Ask me anything…",
  quickReplies: [
    { icon: "people", text: "Where do I find requisitions?" },
    { icon: "doc", text: "Help me in initial setup for HWL" },
    { icon: "clock", text: "Explain timecard lifecycle" },
  ],
} as const;
