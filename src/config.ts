/**
 * config.ts
 * ---------
 * Single source of truth for all run-time configuration.
 * In production, swap the values here (or read from env vars) — zero other
 * files need editing.
 *
 * QUICK-REPLY ICONS
 * Available icon keys (defined in src/assets/icons.tsx → QUICK_REPLY_ICON_MAP):
 *   doc | people | chart | shield | clock | help | briefcase | bell
 */

export type QuickReplyIconKey =
    | 'doc'
    | 'people'
    | 'chart'
    | 'shield'
    | 'clock'
    | 'help'
    | 'briefcase'
    | 'bell';

export interface QuickReply {
    /** Icon key — must match a key in QUICK_REPLY_ICON_MAP */
    icon: QuickReplyIconKey;
    /** The pre-filled message text sent on click */
    text: string;
}

export const APP_CONFIG = {
    // ── API ─────────────────────────────────────────────────────────
    apiUrl: import.meta.env.VITE_API_URL as string | undefined,

    // ── Branding ────────────────────────────────────────────────────
    title:        'HWL Assistant',
    subtitle:     'Your intelligent guide',
    primaryColor: '#0052CC',
    /** Set to an absolute URL to show a custom logo in the sidebar header. */
    logoUrl:      null as string | null,

    // ── JWT auth ────────────────────────────────────────────────────
    /**
     * The host app passes a signed JWT via the URL query param (`?token=…`).
     * On subsequent loads the token is read from sessionStorage.
     */
    jwtParamName:  'token',       // URL query param the host app passes
    jwtStorageKey: 'hwl_jwt_token',

    // ── Chat defaults ────────────────────────────────────────────────
    placeholder: 'Ask me anything…',

    quickReplies: [
        { icon: 'people', text: 'Where do I find requisitions?'     },
        { icon: 'doc',    text: 'Help me in initial setup for HWL'  },
        { icon: 'clock',  text: 'Explain timecard lifecycle'         },
    ] satisfies QuickReply[],
} as const;
