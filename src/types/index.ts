/**
 * types/index.ts
 * --------------
 * Single source of truth for all shared TypeScript types in HWL Assistant.
 * Import from here in every file — never duplicate type definitions.
 */

// ── Core chat types ────────────────────────────────────────────────────
export interface Message {
  id: string;
  role: "user" | "assistant";
  /** Plain text, markdown, or JSON-encoded ResponseComponent[] from dummy/API */
  content: string;
  timestamp: Date;
  attachment?: { name: string; type: string };
}

export interface Session {
  sessionId: string;
  startedAt: Date;
  preview: string;
  messages: Message[];
}

// ── Widget entry-point props ───────────────────────────────────────────
export interface HWLAssistantProps {
  apiUrl: string;
  title?: string;
  theme?: { primaryColor?: string };
  placeholder?: string;
}

// ── Citation ───────────────────────────────────────────────────────────
/**
 * Source attribution returned by the real backend alongside the MDX response.
 * Previously duplicated across api.ts and MessageBubble.tsx — lives here now.
 */
export interface Citation {
  chunk_id: string;
  /** Plain PDF filename e.g. "HWL Agency_Update Email Preferences V2.pdf" */
  source: string;
}

// ── MDX / Dummy response shape ─────────────────────────────────────────
/**
 * The only response type in use. The LLM output and dummy.ts both produce
 * an array of these, serialised as JSON in Message.content.
 * type === "mdx" → render body via @mdx-js/mdx + lib/mdxComponents.ts
 */
export interface MdxData {
  body: string;
}

export interface ResponseComponent {
  type: "mdx";
  data: MdxData;
}

// ── API response shape ─────────────────────────────────────────────────
export interface ApiResponse {
  session_id: string;
  action: "respond" | "clarify" | "not_found" | "quota_exceeded";
  /** Raw MDX string or plain markdown */
  response: string;
  response_type?:
    | "answer"
    | "options"
    | "mixed"
    | "notfound"
    | "clarify"
    | "quota_exceeded";
  citations?: Citation[];
}
