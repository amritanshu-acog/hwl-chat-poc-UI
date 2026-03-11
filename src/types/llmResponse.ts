/**
 * types/llmResponse.ts
 */

export type ResponseAction =
  | "clarify"
  | "respond"
  | "not_found"
  | "quota_exceeded";

export type ResponseType =
  | "clarify"
  | "answer"
  | "options"
  | "mixed"
  | "notfound"
  | "quota_exceeded"
  | "faq"; // ← new

export interface LLMAlert {
  severity: "warning" | "info" | "danger";
  title: string;
  body: string;
}

export interface LLMStep {
  title: string;
  body: string;
}

export interface LLMOption {
  label: string;
  value: string;
  description?: string;
}

export interface LLMFunnelStage {
  label: string;
  description?: string;
}

export interface LLMSummary {
  title: string;
  body: string;
  actions?: string[];
}

export interface LLMEscalation {
  title: string;
  message: string;
  reason?: string;
}

export interface LLMCitation {
  chunk_id: string;
  source: string;
}

// ── new ──────────────────────────────────────────────
export interface LLMFaqItem {
  question: string;
  answer: string;
}
// ─────────────────────────────────────────────────────

export interface LLMResponse {
  action: ResponseAction;
  response_type: ResponseType;
  alert: LLMAlert | null;
  title: string;
  intro?: string | null;
  steps: LLMStep[] | null;
  items: string[] | null;
  options: LLMOption[] | null;
  summary: LLMSummary | null;
  escalation: LLMEscalation | null;
  chart: string | null;
  stages: LLMFunnelStage[] | null;
  followUp?: string | null;
  citations: LLMCitation[];
  faqItems?: LLMFaqItem[] | null; // ← new
  quotaMessage?: string | null; // ← new
}
