/**
 * config.ts
 * ---------
 * Single source of truth for all run-time configuration.
 * In production, swap the values here (or read from env vars) — zero other files need editing.
 */

export const APP_CONFIG = {
  // ── API ───────────────────────────────────────────────
  apiUrl: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",

  // ── Feature flags ────────────────────────────────────
  /** When true the app uses dummy.ts data; when false it calls `apiUrl`. */
  demoMode: true,

  // ── Branding ─────────────────────────────────────────
  title: "HWL Assistant",
  subtitle: "Your intelligent guide",
  primaryColor: "#0052CC",
  logoUrl: null as string | null, // set to a URL to show a custom logo

  // ── JWT auth ─────────────────────────────────────────
  /**
   * In real integration the host app calls window.postMessage or passes the
   * token via a query param / custom React prop.
   * For demo we auto-generate a fake token on first load.
   */
  jwtParamName: "token", // URL query param name the host app passes
  jwtStorageKey: "hwl_jwt_token",
  jwtSecret: import.meta.env.VITE_JWT_SECRET ?? "", // ← add this

  // ── Chat defaults ─────────────────────────────────────
  placeholder: "Ask me anything…",
  quickReplies: [
    { icon: "people", text: "Where do I find requisitions?" },
    { icon: "doc", text: "Help me in initial setup for HWL" },
    { icon: "clock", text: "Explain timecard lifecycle" },
  ],
} as const;
