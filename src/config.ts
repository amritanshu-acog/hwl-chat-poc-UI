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
  demoMode: false,

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

  // ── Chat defaults ─────────────────────────────────────
  placeholder: "Ask me anything…",
  quickReplies: [
    { icon: "doc", text: "How do I create a requisition?" },
    { icon: "people", text: "Explain the onboarding process" },
    { icon: "clock", text: "How do I request leave?" },
  ],
} as const;
